import request from "supertest";
import mongoose from "mongoose";
import { MongoMemoryServer } from "mongodb-memory-server";
import { app } from "../../src/app";
import { sendOtpEmail } from "../../src/services/email.service";

const sendOtpEmailMock = sendOtpEmail as jest.Mock;

let mongo: MongoMemoryServer;

beforeAll(async () => {
  mongo = await MongoMemoryServer.create();
  await mongoose.connect(mongo.getUri());
});

afterAll(async () => {
  await mongoose.disconnect();
  await mongo.stop();
});

afterEach(async () => {
  const collections = mongoose.connection.collections;
  for (const key of Object.keys(collections)) {
    await collections[key].deleteMany({});
  }
  sendOtpEmailMock.mockClear();
});

/** Registers `payload` and returns the OTP code that would have been emailed,
 * captured from the mocked email service instead of a real inbox. */
async function registerAndCaptureCode(payload: { name: string; email: string; password: string }) {
  const res = await request(app).post("/api/auth/register").send(payload);
  const [, code] = sendOtpEmailMock.mock.calls[sendOtpEmailMock.mock.calls.length - 1];
  return { res, code };
}

describe("auth", () => {
  const payload = { name: "Jane Doe", email: "jane@example.com", password: "supersecret" };

  it("registers a new user, emails an OTP, and does not log them in yet", async () => {
    const { res } = await registerAndCaptureCode(payload);
    expect(res.status).toBe(201);
    expect(res.body.token).toBeUndefined();
    expect(res.body.email).toBe(payload.email);
    expect(sendOtpEmailMock).toHaveBeenCalledWith(payload.email, expect.any(String), "verify-email");
  });

  it("rejects duplicate email registration", async () => {
    await request(app).post("/api/auth/register").send(payload);
    const res = await request(app).post("/api/auth/register").send(payload);
    expect(res.status).toBe(409);
  });

  it("blocks login before the email is verified", async () => {
    await registerAndCaptureCode(payload);
    const res = await request(app)
      .post("/api/auth/login")
      .send({ email: payload.email, password: payload.password });
    expect(res.status).toBe(403);
    expect(res.body.details?.code).toBe("EMAIL_NOT_VERIFIED");
  });

  it("verifies the email with the correct code and logs the user in", async () => {
    const { code } = await registerAndCaptureCode(payload);
    const verifyRes = await request(app)
      .post("/api/auth/verify-email")
      .send({ email: payload.email, code });
    expect(verifyRes.status).toBe(200);
    expect(verifyRes.body.token).toBeDefined();

    const loginRes = await request(app)
      .post("/api/auth/login")
      .send({ email: payload.email, password: payload.password });
    expect(loginRes.status).toBe(200);
    expect(loginRes.body.token).toBeDefined();
  });

  it("rejects an incorrect verification code", async () => {
    await registerAndCaptureCode(payload);
    const res = await request(app)
      .post("/api/auth/verify-email")
      .send({ email: payload.email, code: "000000" });
    expect(res.status).toBe(400);
  });

  it("rejects login with wrong password", async () => {
    const { code } = await registerAndCaptureCode(payload);
    await request(app).post("/api/auth/verify-email").send({ email: payload.email, code });

    const res = await request(app)
      .post("/api/auth/login")
      .send({ email: payload.email, password: "wrong-password" });
    expect(res.status).toBe(401);
  });

  it("rejects /me without a token", async () => {
    const res = await request(app).get("/api/auth/me");
    expect(res.status).toBe(401);
  });

  it("returns the current user for a valid token", async () => {
    const { code } = await registerAndCaptureCode(payload);
    const verifyRes = await request(app)
      .post("/api/auth/verify-email")
      .send({ email: payload.email, code });

    const res = await request(app)
      .get("/api/auth/me")
      .set("Authorization", `Bearer ${verifyRes.body.token}`);
    expect(res.status).toBe(200);
    expect(res.body.user.email).toBe(payload.email);
  });

  describe("password reset", () => {
    async function verifiedUser() {
      const { code } = await registerAndCaptureCode(payload);
      await request(app).post("/api/auth/verify-email").send({ email: payload.email, code });
      sendOtpEmailMock.mockClear();
    }

    it("resets the password with a valid code and allows login with the new password", async () => {
      await verifiedUser();

      await request(app).post("/api/auth/forgot-password").send({ email: payload.email });
      const [, resetCode] = sendOtpEmailMock.mock.calls[0];

      const resetRes = await request(app)
        .post("/api/auth/reset-password")
        .send({ email: payload.email, code: resetCode, newPassword: "newpassword123" });
      expect(resetRes.status).toBe(200);

      const oldLogin = await request(app)
        .post("/api/auth/login")
        .send({ email: payload.email, password: payload.password });
      expect(oldLogin.status).toBe(401);

      const newLogin = await request(app)
        .post("/api/auth/login")
        .send({ email: payload.email, password: "newpassword123" });
      expect(newLogin.status).toBe(200);
    });

    it("does not reveal whether an email exists", async () => {
      const res = await request(app)
        .post("/api/auth/forgot-password")
        .send({ email: "nobody@example.com" });
      expect(res.status).toBe(200);
      expect(sendOtpEmailMock).not.toHaveBeenCalled();
    });
  });
});
