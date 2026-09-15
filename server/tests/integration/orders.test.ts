import request from "supertest";
import mongoose from "mongoose";
import { MongoMemoryServer } from "mongodb-memory-server";
import { app } from "../../src/app";
import { Product } from "../../src/models/Product";
import { Order } from "../../src/models/Order";
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

const CHECKOUT_DETAILS = {
  shippingAddress: {
    fullName: "Test Shopper",
    phone: "+961 70 000 000",
    line1: "12 Test Street",
    city: "Beirut",
    postalCode: "1100",
    country: "Lebanon",
  },
  payment: { brand: "Visa", last4: "4242" },
};

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

  return request(app)
    .post("/api/orders")
    .set("Authorization", `Bearer ${token}`)
    .send(CHECKOUT_DETAILS);
}

describe("checkout", () => {
  it("stores the shipping address and the card summary on the order", async () => {
    const token = await registerAndLogin("checkout@example.com");
    const product = await makeProduct("checkout-buy");
    const res = await buy(token, product._id.toString());

    expect(res.status).toBe(201);
    expect(res.body.order.shippingAddress).toMatchObject({
      fullName: "Test Shopper",
      line1: "12 Test Street",
      city: "Beirut",
      country: "Lebanon",
    });
    expect(res.body.order.payment).toEqual({ brand: "Visa", last4: "4242" });
  });

  it("rejects a checkout with missing shipping fields", async () => {
    const token = await registerAndLogin("incomplete@example.com");
    const product = await makeProduct("incomplete-buy");

    await request(app)
      .post("/api/cart")
      .set("Authorization", `Bearer ${token}`)
      .send({ productId: product._id.toString(), variantSelection: { Size: "M" }, quantity: 1 });

    const res = await request(app)
      .post("/api/orders")
      .set("Authorization", `Bearer ${token}`)
      .send({
        shippingAddress: { ...CHECKOUT_DETAILS.shippingAddress, city: "", postalCode: "" },
        payment: CHECKOUT_DETAILS.payment,
      });

    expect(res.status).toBe(400);
    expect(res.body.details?.fieldErrors).toBeDefined();
  });

  it("rejects anything longer than the last 4 digits of the card", async () => {
    const token = await registerAndLogin("pan@example.com");
    const product = await makeProduct("pan-buy");

    await request(app)
      .post("/api/cart")
      .set("Authorization", `Bearer ${token}`)
      .send({ productId: product._id.toString(), variantSelection: { Size: "M" }, quantity: 1 });

    const res = await request(app)
      .post("/api/orders")
      .set("Authorization", `Bearer ${token}`)
      .send({
        shippingAddress: CHECKOUT_DETAILS.shippingAddress,
        payment: { brand: "Visa", last4: "4242424242424242" },
      });

    expect(res.status).toBe(400);
  });

  it("never persists a full card number, expiry or CVV even if one is sent", async () => {
    const token = await registerAndLogin("sneaky@example.com");
    const product = await makeProduct("sneaky-buy");

    await request(app)
      .post("/api/cart")
      .set("Authorization", `Bearer ${token}`)
      .send({ productId: product._id.toString(), variantSelection: { Size: "M" }, quantity: 1 });

    const res = await request(app)
      .post("/api/orders")
      .set("Authorization", `Bearer ${token}`)
      .send({
        ...CHECKOUT_DETAILS,
        cardNumber: "4242424242424242",
        cvv: "123",
        expiry: "12/30",
        payment: { ...CHECKOUT_DETAILS.payment, cvv: "123" },
      });

    expect(res.status).toBe(201);

    // The validator strips unknown keys, so none of it should reach the document.
    const stored = await Order.findById(res.body.order._id).lean();
    const serialised = JSON.stringify(stored);
    expect(serialised).not.toContain("4242424242424242");
    expect(serialised).not.toContain("cvv");
    expect(serialised).not.toContain("expiry");
    expect(stored?.payment).toEqual({ brand: "Visa", last4: "4242" });
  });
});

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
