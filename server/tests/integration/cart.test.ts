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
  const collections = mongoose.connection.collections;
  for (const key of Object.keys(collections)) {
    await collections[key].deleteMany({});
  }
});

async function registerAndLogin() {
  const res = await request(app)
    .post("/api/auth/register")
    .send({ name: "Cart Tester", email: "cart@example.com", password: "supersecret" });
  return res.body.token as string;
}

async function makeProduct() {
  return Product.create({
    slug: "cart-shirt",
    title: "Cart Shirt",
    price: 2000,
    description: "desc",
    images: ["/products/cart-shirt/a.jpg"],
    thumbnail: "/products/cart-shirt/a.jpg",
    category: "T-Shirts",
    variants: [{ name: "Size", options: [{ value: "M", stock: 2 }] }],
    baseStock: 0,
  });
}

describe("cart", () => {
  it("adds an item and reflects it in GET /cart with correct subtotal/total", async () => {
    const token = await registerAndLogin();
    const product = await makeProduct();

    const addRes = await request(app)
      .post("/api/cart")
      .set("Authorization", `Bearer ${token}`)
      .send({ productId: product._id, variantSelection: { Size: "M" }, quantity: 2 });

    expect(addRes.status).toBe(200);
    expect(addRes.body.items).toHaveLength(1);
    expect(addRes.body.items[0].subtotal).toBe(4000);
    expect(addRes.body.total).toBe(4000);

    const getRes = await request(app).get("/api/cart").set("Authorization", `Bearer ${token}`);
    expect(getRes.body.total).toBe(4000);
  });

  it("rejects adding more than available stock", async () => {
    const token = await registerAndLogin();
    const product = await makeProduct();

    const res = await request(app)
      .post("/api/cart")
      .set("Authorization", `Bearer ${token}`)
      .send({ productId: product._id, variantSelection: { Size: "M" }, quantity: 5 });

    expect(res.status).toBe(400);
  });

  it("updates quantity and recalculates total", async () => {
    const token = await registerAndLogin();
    const product = await makeProduct();

    const addRes = await request(app)
      .post("/api/cart")
      .set("Authorization", `Bearer ${token}`)
      .send({ productId: product._id, variantSelection: { Size: "M" }, quantity: 1 });

    const itemId = addRes.body.items[0].itemId;

    const patchRes = await request(app)
      .patch(`/api/cart/${itemId}`)
      .set("Authorization", `Bearer ${token}`)
      .send({ quantity: 2 });

    expect(patchRes.status).toBe(200);
    expect(patchRes.body.total).toBe(4000);
  });

  it("removes an item, leaving the cart empty", async () => {
    const token = await registerAndLogin();
    const product = await makeProduct();

    const addRes = await request(app)
      .post("/api/cart")
      .set("Authorization", `Bearer ${token}`)
      .send({ productId: product._id, variantSelection: { Size: "M" }, quantity: 1 });

    const itemId = addRes.body.items[0].itemId;

    const delRes = await request(app)
      .delete(`/api/cart/${itemId}`)
      .set("Authorization", `Bearer ${token}`);

    expect(delRes.status).toBe(200);
    expect(delRes.body.items).toHaveLength(0);
  });

  it("requires authentication", async () => {
    const res = await request(app).get("/api/cart");
    expect(res.status).toBe(401);
  });
});
