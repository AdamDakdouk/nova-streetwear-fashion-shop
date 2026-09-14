import request from "supertest";
import mongoose from "mongoose";
import { MongoMemoryServer } from "mongodb-memory-server";
import { app } from "../../src/app";
import { Product } from "../../src/models/Product";
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

async function makeVerifiedUser(email: string) {
  await request(app)
    .post("/api/auth/register")
    .send({ name: "Reviewer", email, password: "supersecret" });

  const [, code] = sendOtpEmailMock.mock.calls[sendOtpEmailMock.mock.calls.length - 1];
  const verifyRes = await request(app).post("/api/auth/verify-email").send({ email, code });
  return verifyRes.body.token as string;
}

async function makeProduct() {
  return Product.create({
    slug: "review-shirt",
    title: "Review Shirt",
    price: 2000,
    description: "desc",
    images: ["/products/review-shirt/a.jpg"],
    thumbnail: "/products/review-shirt/a.jpg",
    category: "T-Shirts",
    variants: [],
    baseStock: 10,
  });
}

describe("reviews", () => {
  it("requires authentication to submit a review", async () => {
    const product = await makeProduct();
    const res = await request(app)
      .post(`/api/products/${product._id}/reviews`)
      .send({ rating: 5, comment: "Great" });
    expect(res.status).toBe(401);
  });

  it("lets a user submit a review and reflects it in the product's rating summary", async () => {
    const product = await makeProduct();
    const token = await makeVerifiedUser("reviewer1@example.com");

    const submitRes = await request(app)
      .post(`/api/products/${product._id}/reviews`)
      .set("Authorization", `Bearer ${token}`)
      .send({ rating: 4, comment: "Solid fit" });
    expect(submitRes.status).toBe(201);
    expect(submitRes.body.rating).toBe(4);
    expect(submitRes.body.userName).toBe("Reviewer");

    const productRes = await request(app).get(`/api/products/${product._id}`);
    expect(productRes.body.avgRating).toBe(4);
    expect(productRes.body.reviewCount).toBe(1);
  });

  it("upserts instead of duplicating when the same user reviews again", async () => {
    const product = await makeProduct();
    const token = await makeVerifiedUser("reviewer2@example.com");

    await request(app)
      .post(`/api/products/${product._id}/reviews`)
      .set("Authorization", `Bearer ${token}`)
      .send({ rating: 2, comment: "Meh" });

    await request(app)
      .post(`/api/products/${product._id}/reviews`)
      .set("Authorization", `Bearer ${token}`)
      .send({ rating: 5, comment: "Actually great after a wash" });

    const listRes = await request(app).get(`/api/products/${product._id}/reviews`);
    expect(listRes.body).toHaveLength(1);
    expect(listRes.body[0].rating).toBe(5);
  });

  it("averages multiple users' ratings correctly", async () => {
    const product = await makeProduct();
    const tokenA = await makeVerifiedUser("reviewer3@example.com");
    const tokenB = await makeVerifiedUser("reviewer4@example.com");

    await request(app)
      .post(`/api/products/${product._id}/reviews`)
      .set("Authorization", `Bearer ${tokenA}`)
      .send({ rating: 3 });
    await request(app)
      .post(`/api/products/${product._id}/reviews`)
      .set("Authorization", `Bearer ${tokenB}`)
      .send({ rating: 5 });

    const listRes = await request(app).get("/api/products");
    const entry = listRes.body.find((p: { _id: string }) => p._id === String(product._id));
    expect(entry.avgRating).toBe(4);
    expect(entry.reviewCount).toBe(2);
  });

  it("lets a user delete their own review", async () => {
    const product = await makeProduct();
    const token = await makeVerifiedUser("reviewer5@example.com");

    await request(app)
      .post(`/api/products/${product._id}/reviews`)
      .set("Authorization", `Bearer ${token}`)
      .send({ rating: 3 });

    const delRes = await request(app)
      .delete(`/api/products/${product._id}/reviews`)
      .set("Authorization", `Bearer ${token}`);
    expect(delRes.status).toBe(200);

    const productRes = await request(app).get(`/api/products/${product._id}`);
    expect(productRes.body.reviewCount).toBe(0);
  });

  it("rejects an out-of-range rating", async () => {
    const product = await makeProduct();
    const token = await makeVerifiedUser("reviewer6@example.com");

    const res = await request(app)
      .post(`/api/products/${product._id}/reviews`)
      .set("Authorization", `Bearer ${token}`)
      .send({ rating: 7 });
    expect(res.status).toBe(400);
  });
});
