import { describe, test, expect } from "bun:test";
import { createApp } from "../src/index";

describe("users.create", () => {
  test("should fail validation if body is incomplete", async () => {
    const app = await createApp();

    const response = await app.request("/users", {
      method: "POST",
      body: {
        name: "John Doe",
        // missing email and password
      } as any,
    });

    expect(response.status).toEqual(400);
  });

  test("should create user", async () => {
    const app = await createApp();

    const response = await app.request("/users", {
      method: "POST",
      body: {
        name: "John Doe",
        email: "invalid-email",
        password: "123456",
      } as any,
    });

    expect(response.status).toEqual(201);
    const body = await response.json();
  });
});
