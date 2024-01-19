import { describe, test, expect } from "bun:test";
import { createApp } from "../src/index";
import { faker } from "@faker-js/faker";
import { request } from "./helpers";

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
  });
});
