import request from "supertest";
import mongoose from "mongoose";
import { MongoMemoryServer } from "mongodb-memory-server";
import { app } from "../../src/app";
import { Product } from "../../src/models/Product";

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
  await Product.deleteMany({});
});

async function makeProduct(overrides: Partial<Record<string, unknown>> = {}) {
  return Product.create({
    slug: "test-shirt",
    title: "Test Shirt",
    price: 1999,
    description: "A shirt for testing.",
    images: ["/products/test-shirt/a.jpg"],
    thumbnail: "/products/test-shirt/a.jpg",
    category: "T-Shirts",
    variants: [{ name: "Size", options: [{ value: "M", stock: 5 }] }],
    baseStock: 0,
    ...overrides,
  });
}

describe("products", () => {
  it("lists all products with summary fields", async () => {
    await makeProduct();
    await makeProduct({ slug: "test-shirt-2", title: "Test Shirt 2" });

    const res = await request(app).get("/api/products");
    expect(res.status).toBe(200);
    expect(res.body).toHaveLength(2);
    expect(res.body[0]).toMatchObject({ title: expect.any(String), price: expect.any(Number) });
    expect(res.body[0].variants).toHaveLength(1);
    expect(res.body[0].variants[0]).toMatchObject({ name: "Size" });
  });

  it("returns 404 for an unknown product id", async () => {
    const res = await request(app).get("/api/products/000000000000000000000000");
    expect(res.status).toBe(404);
  });

  it("returns full detail including totalStock for a known product", async () => {
    const product = await makeProduct();
    const res = await request(app).get(`/api/products/${product._id}`);
    expect(res.status).toBe(200);
    expect(res.body.title).toBe("Test Shirt");
    expect(res.body.totalStock).toBe(5);
  });
});
