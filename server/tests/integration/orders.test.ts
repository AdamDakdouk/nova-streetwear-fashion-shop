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

async function registerAndLogin(email: string) {
  await request(app)
    .post("/api/auth/register")
    .send({ name: "Order Tester", email, password: "supersecret" });

  const [, code] = sendOtpEmailMock.mock.calls[sendOtpEmailMock.mock.calls.length - 1];
  const verifyRes = await request(app).post("/api/auth/verify-email").send({ email, code });

  return verifyRes.body.token as string;
}

async function makeProduct(slug: string) {
  return Product.create({
    slug,
    title: `Product ${slug}`,
    price: 2500,
    description: "desc",
    images: [`/products/${slug}/a.jpg`],
    thumbnail: `/products/${slug}/a.jpg`,
    category: "T-Shirts",
    variants: [{ name: "Size", options: [{ value: "M", stock: 5 }] }],
    baseStock: 0,
  });
}

async function buy(token: string, productId: string) {
  await request(app)
    .post("/api/cart")
    .set("Authorization", `Bearer ${token}`)
    .send({ productId, variantSelection: { Size: "M" }, quantity: 1 });

  return request(app).post("/api/orders").set("Authorization", `Bearer ${token}`);
}

describe("order history", () => {
  it("rejects an unauthenticated request with 401", async () => {
    const res = await request(app).get("/api/orders");
    expect(res.status).toBe(401);
  });

  it("returns an empty list for a shopper who has never ordered", async () => {
    const token = await registerAndLogin("noorders@example.com");
    const res = await request(app).get("/api/orders").set("Authorization", `Bearer ${token}`);
    expect(res.status).toBe(200);
    expect(res.body.orders).toEqual([]);
  });

  it("returns the caller's orders with their line items, newest first", async () => {
    const token = await registerAndLogin("buyer@example.com");
    const first = await makeProduct("first-buy");
    const second = await makeProduct("second-buy");

    await buy(token, first._id.toString());
    await buy(token, second._id.toString());

    const res = await request(app).get("/api/orders").set("Authorization", `Bearer ${token}`);

    expect(res.status).toBe(200);
    expect(res.body.orders).toHaveLength(2);
    // Newest first, so the second purchase leads.
    expect(res.body.orders[0].items[0].title).toBe("Product second-buy");
    expect(res.body.orders[1].items[0].title).toBe("Product first-buy");
    // The details the account page renders have to survive the round trip.
    expect(res.body.orders[0].items[0]).toMatchObject({
      quantity: 1,
      unitPrice: 2500,
      subtotal: 2500,
      variantSelection: { Size: "M" },
    });
    expect(res.body.orders[0].total).toBe(2500);
  });

  it("never returns another shopper's orders", async () => {
    const buyerToken = await registerAndLogin("owner@example.com");
    const product = await makeProduct("private-buy");
    await buy(buyerToken, product._id.toString());

    const otherToken = await registerAndLogin("nosy@example.com");
    const res = await request(app).get("/api/orders").set("Authorization", `Bearer ${otherToken}`);

    expect(res.status).toBe(200);
    expect(res.body.orders).toEqual([]);
  });
});
