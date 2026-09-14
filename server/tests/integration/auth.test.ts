import request from "supertest";
import mongoose from "mongoose";
import { MongoMemoryServer } from "mongodb-memory-server";
import { app } from "../../src/app";

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
});

describe("auth", () => {
  const payload = { name: "Jane Doe", email: "jane@example.com", password: "supersecret" };

  it("registers a new user and returns a token", async () => {
    const res = await request(app).post("/api/auth/register").send(payload);
    expect(res.status).toBe(201);
    expect(res.body.token).toBeDefined();
    expect(res.body.user.email).toBe(payload.email);
    expect(res.body.user.passwordHash).toBeUndefined();
  });

  it("rejects duplicate email registration", async () => {
    await request(app).post("/api/auth/register").send(payload);
    const res = await request(app).post("/api/auth/register").send(payload);
    expect(res.status).toBe(409);
  });

  it("rejects login with wrong password", async () => {
    await request(app).post("/api/auth/register").send(payload);
    const res = await request(app)
      .post("/api/auth/login")
      .send({ email: payload.email, password: "wrong-password" });
    expect(res.status).toBe(401);
  });

  it("logs in with correct credentials", async () => {
    await request(app).post("/api/auth/register").send(payload);
    const res = await request(app)
      .post("/api/auth/login")
      .send({ email: payload.email, password: payload.password });
    expect(res.status).toBe(200);
    expect(res.body.token).toBeDefined();
  });

  it("rejects /me without a token", async () => {
    const res = await request(app).get("/api/auth/me");
    expect(res.status).toBe(401);
  });

  it("returns the current user for a valid token", async () => {
    const register = await request(app).post("/api/auth/register").send(payload);
    const res = await request(app)
      .get("/api/auth/me")
      .set("Authorization", `Bearer ${register.body.token}`);
    expect(res.status).toBe(200);
    expect(res.body.user.email).toBe(payload.email);
  });
});
