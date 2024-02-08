import { describe, test, expect } from "bun:test";
import { createApp } from "../src/index";
import { faker } from "@faker-js/faker";
import { getAdminBearerToken, request } from "./helpers";

const app = await createApp();
const adminToken = await getAdminBearerToken(app);

describe("auth with cookies", () => {
  test("should not be able to get current user data if not logged", async () => {
    const email = faker.internet.email();
    const password = faker.internet.password();

    // Create user
    const createResponse = await request(app, adminToken).post("/users", {
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

    const createResponseJson = await createResponse.json();
    delete createResponseJson.user.__v;
    delete createResponseJson.user.password;
    delete createResponseJson.user.updatedAt;

    // Expect the user data to be the same as the one created
    expect((await meResponse.json()).user).toEqual(createResponseJson.user);
  });
});

describe("auth with bearer", () => {
  test("should not be able to get current user data if not logged", async () => {
    const email = faker.internet.email();
    const password = faker.internet.password();

    // Create user
    const createResponse = await request(app, adminToken).post("/users", {
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
        Authorization: `Bearer ${token}`,
      },
    });
    await meResponse.expectStatusToBe(200);

    const createResponseJson = await createResponse.json();
    delete createResponseJson.user.__v;
    delete createResponseJson.user.password;
    delete createResponseJson.user.updatedAt;

    // Expect the user data to be the same as the one created
    expect((await meResponse.json()).user).toEqual(createResponseJson.user);
  });
});

describe("auth register", () => {
  test("should register user successfully", async () => {
    const email = faker.internet.email();
    const password = faker.internet.password();
    const name = faker.person.firstName();
    const surname = faker.person.lastName();
    const dni = faker.lorem.word({ length: { min: 9, max: 9 } });

    const response = await request(app).post("/register", {
      email,
      password,
      name,
      surname,
      dni,
    });

    expect(response.status).toBe(201);
  });
});

describe("auth logout", () => {
  test("should logout successfully", async () => {
    const email = faker.internet.email();
    const password = faker.internet.password();

    const createResponse = await request(app, adminToken).post("/users", {
      email,
      password,
    });

    await createResponse.expectStatusToBe(201);

    const loginResponse = await request(app).post("/login", {
      email,
      password,
    });
    await loginResponse.expectStatusToBe(200);

    const token = (await loginResponse.json()).token;

    const logoutResponse = await request(app, token).get("/logout");
    expect(logoutResponse.status).toBe(200);
    expect(logoutResponse.raw.headers.get("set-cookie")).toContain("token=;");
  });
});

