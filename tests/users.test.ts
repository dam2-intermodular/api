import { describe, test, expect } from "bun:test";
import { createApp } from "../src/index";
import { faker } from "@faker-js/faker";
import { request } from "./helpers";
import { User } from "../src/models/user";

describe("users.create", () => {
  test("should fail validation if body is incomplete", async () => {
    const app = await createApp();

    const response = await request(app).post("/users", {
      name: "John Doe",
      // missing email and password
    });

    expect(response.status).toEqual(400);
  });

  test("should create user", async () => {
    const app = await createApp();

    const response = await request(app).post("/users", {
      name: faker.person.fullName(),
      email: faker.internet.email(),
      password: faker.internet.password(),
    });

    expect(response.status).toEqual(201);

    const data = (await response.json()).user;
    const success = await User.findOne({ _id: data._id }).exec();

    expect(success?.email).toBe(data.email);
  });

  test("should check that email doesn't exist", async () => {
    const app = await createApp();
    const email = faker.internet.email();

    const response1 = await request(app).post("/users", {
      name: faker.person.fullName(),
      email,
      password: faker.internet.password(),
    });

    expect(response1.status).toEqual(201);

    const response2 = await request(app).post("/users", {
      name: faker.person.fullName(),
      email,
      password: faker.internet.password(),
    });

    expect(response2.status).toEqual(400);
  });
});
