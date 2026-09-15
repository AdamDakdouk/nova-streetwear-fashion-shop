import request from "supertest";
import mongoose from "mongoose";
import { MongoMemoryServer } from "mongodb-memory-server";
import { app } from "../../src/app";
import { User } from "../../src/models/User";
import { Product } from "../../src/models/Product";
import { sendOtpEmail } from "../../src/services/email.service";
import { uploadImageBuffer } from "../../src/services/storage.service";

const sendOtpEmailMock = sendOtpEmail as jest.Mock;
const uploadImageBufferMock = uploadImageBuffer as jest.Mock;

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

async function makeVerifiedUser(email: string, role: "user" | "admin" = "user") {
  await request(app)
    .post("/api/auth/register")
    .send({ name: "Test User", email, password: "supersecret" });

  const [, code] = sendOtpEmailMock.mock.calls[sendOtpEmailMock.mock.calls.length - 1];
  const verifyRes = await request(app).post("/api/auth/verify-email").send({ email, code });

  if (role === "admin") {
    await User.updateOne({ email }, { role: "admin" });
  }

  const loginRes = await request(app)
    .post("/api/auth/login")
    .send({ email, password: "supersecret" });

  return loginRes.body.token as string;
}

const validProduct = {
  slug: "test-jacket",
  title: "Test Jacket",
  price: 9900,
  description: "A jacket for testing.",
  category: "Jackets",
  images: ["/products/test-jacket/a.jpg"],
  thumbnail: "/products/test-jacket/a.jpg",
  variants: [{ name: "Size", options: [{ value: "M", stock: 5 }] }],
  baseStock: 0,
};

describe("admin product management", () => {
  it("rejects a non-admin user with 403", async () => {
    const token = await makeVerifiedUser("shopper@example.com", "user");
    const res = await request(app)
      .post("/api/admin/products")
      .set("Authorization", `Bearer ${token}`)
      .send(validProduct);
    expect(res.status).toBe(403);
  });

  it("rejects an unauthenticated request with 401", async () => {
    const res = await request(app).get("/api/admin/products");
    expect(res.status).toBe(401);
  });

  it("lets an admin create, update, and delete a product", async () => {
    const token = await makeVerifiedUser("owner@example.com", "admin");

    const createRes = await request(app)
      .post("/api/admin/products")
      .set("Authorization", `Bearer ${token}`)
      .send(validProduct);
    expect(createRes.status).toBe(201);
    expect(createRes.body.slug).toBe("test-jacket");
    const productId = createRes.body._id;

    const updateRes = await request(app)
      .put(`/api/admin/products/${productId}`)
      .set("Authorization", `Bearer ${token}`)
      .send({ ...validProduct, price: 12900 });
    expect(updateRes.status).toBe(200);
    expect(updateRes.body.price).toBe(12900);

    const listRes = await request(app)
      .get("/api/admin/products")
      .set("Authorization", `Bearer ${token}`);
    expect(listRes.status).toBe(200);
    expect(listRes.body).toHaveLength(1);

    const deleteRes = await request(app)
      .delete(`/api/admin/products/${productId}`)
      .set("Authorization", `Bearer ${token}`);
    expect(deleteRes.status).toBe(200);

    const afterDelete = await Product.findById(productId);
    expect(afterDelete).toBeNull();
  });

  it("rejects an invalid product payload with per-field errors", async () => {
    const token = await makeVerifiedUser("owner2@example.com", "admin");
    const res = await request(app)
      .post("/api/admin/products")
      .set("Authorization", `Bearer ${token}`)
      .send({ ...validProduct, price: -5 });
    expect(res.status).toBe(400);
    expect(res.body.details?.fieldErrors?.price).toBeDefined();
  });

  it("removes a deleted product from wishlists instead of returning a null entry", async () => {
    const token = await makeVerifiedUser("shopper2@example.com", "user");
    const adminToken = await makeVerifiedUser("owner3@example.com", "admin");

    const createRes = await request(app)
      .post("/api/admin/products")
      .set("Authorization", `Bearer ${adminToken}`)
      .send({ ...validProduct, slug: "wishlist-test", variants: [] });
    const productId = createRes.body._id;

    await request(app)
      .post("/api/wishlist")
      .set("Authorization", `Bearer ${token}`)
      .send({ productId });

    await request(app)
      .delete(`/api/admin/products/${productId}`)
      .set("Authorization", `Bearer ${adminToken}`);

    const wishlistRes = await request(app)
      .get("/api/wishlist")
      .set("Authorization", `Bearer ${token}`);
    expect(wishlistRes.status).toBe(200);
    expect(wishlistRes.body).toEqual([]);
  });

  describe("image upload", () => {
    it("rejects a non-admin", async () => {
      const token = await makeVerifiedUser("uploader1@example.com", "user");
      const res = await request(app)
        .post("/api/admin/upload")
        .set("Authorization", `Bearer ${token}`)
        .attach("image", Buffer.from("fake-image-bytes"), { filename: "photo.jpg", contentType: "image/jpeg" });
      expect(res.status).toBe(403);
    });

    it("uploads a valid image and returns the storage URL, never touching local disk", async () => {
      const token = await makeVerifiedUser("uploader2@example.com", "admin");

      const res = await request(app)
        .post("/api/admin/upload")
        .set("Authorization", `Bearer ${token}`)
        .attach("image", Buffer.from("fake-image-bytes"), { filename: "photo.jpg", contentType: "image/jpeg" });

      expect(res.status).toBe(201);
      expect(res.body.url).toBe("https://mock-r2-public-url.example/products/mock.jpg");
      expect(uploadImageBufferMock).toHaveBeenCalledWith(
        expect.any(Buffer),
        "photo.jpg",
        "image/jpeg"
      );
    });

    it("rejects a non-image file type before it ever reaches storage", async () => {
      const token = await makeVerifiedUser("uploader3@example.com", "admin");
      uploadImageBufferMock.mockClear();

      const res = await request(app)
        .post("/api/admin/upload")
        .set("Authorization", `Bearer ${token}`)
        .attach("image", Buffer.from("not an image"), { filename: "notes.txt", contentType: "text/plain" });

      expect(res.status).toBe(400);
      expect(uploadImageBufferMock).not.toHaveBeenCalled();
    });
  });
});
