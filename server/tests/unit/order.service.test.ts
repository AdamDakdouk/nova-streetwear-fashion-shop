import mongoose from "mongoose";
import { MongoMemoryServer } from "mongodb-memory-server";
import { User } from "../../src/models/User";
import { Product } from "../../src/models/Product";
import { placeOrder } from "../../src/services/order.service";
import { ApiError } from "../../src/utils/ApiError";

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

async function makeUserWithCart(quantity: number) {
  const product = await Product.create({
    slug: "order-shirt",
    title: "Order Shirt",
    price: 1500,
    description: "desc",
    images: ["/x.jpg"],
    thumbnail: "/x.jpg",
    category: "T-Shirts",
    variants: [{ name: "Size", options: [{ value: "M", stock: 3 }] }],
    baseStock: 0,
  });

  const user = await User.create({
    name: "Order Tester",
    email: "order@example.com",
    passwordHash: "hash",
    cart: [{ product: product._id, variantSelection: { Size: "M" }, quantity }],
  });

  return { user, product };
}

describe("placeOrder", () => {
  it("throws when the cart is empty", async () => {
    const user = await User.create({ name: "Empty", email: "empty@example.com", passwordHash: "h" });
    await expect(placeOrder(user)).rejects.toBeInstanceOf(ApiError);
  });

  it("creates an order, decrements stock, and clears the cart on success", async () => {
    const { user, product } = await makeUserWithCart(2);

    const order = await placeOrder(user);

    expect(order.total).toBe(3000);
    expect(order.items).toHaveLength(1);

    const refreshedUser = await User.findById(user._id);
    expect(refreshedUser!.cart).toHaveLength(0);

    const refreshedProduct = await Product.findById(product._id);
    expect(refreshedProduct!.variants[0].options[0].stock).toBe(1);
  });

  it("rejects when quantity exceeds stock, without mutating cart or stock", async () => {
    const { user, product } = await makeUserWithCart(10);

    await expect(placeOrder(user)).rejects.toMatchObject({ statusCode: 409 });

    const refreshedUser = await User.findById(user._id);
    expect(refreshedUser!.cart).toHaveLength(1);

    const refreshedProduct = await Product.findById(product._id);
    expect(refreshedProduct!.variants[0].options[0].stock).toBe(3);
  });
});
