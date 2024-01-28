import { describe, test, expect } from "bun:test";
import { createApp } from "../src/index";
import { faker } from "@faker-js/faker";
import { request } from "./helpers";

describe("auth", () => {
  test("should not be able to get current user data if not logged", async () => {
    const app = await createApp();

    const email = faker.internet.email();
    const password = faker.internet.password();

    // Create user
    const createResponse = await request(app).post("/users", {
      name: faker.person.fullName(),
      email,
      password,
    });
    await createResponse.expectStatusToBe(201);

    // Try to get current user data without being logged
    await (await request(app).get("/me")).expectStatusToBe(401);

    const loginResponse = await request(app).post("/login", {
      email,
      password,
    });
    await loginResponse.expectStatusToBe(200);

    const token = (await loginResponse.json()).token;

    const meResponse = await request(app).get("/me", {
      headers: {
        Cookie: `token=${token}`,
      },
    });
    await meResponse.expectStatusToBe(200);

    // Expect the user data to be the same as the one created
    expect((await meResponse.json()).user).toEqual(
      (await createResponse.json()).user
    );
  });
});
