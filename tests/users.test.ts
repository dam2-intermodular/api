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
      email: faker.internet.email(),
      password: faker.internet.password(),
      user_data: {
        name: faker.person.fullName(),
      },
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
      email,
      password: faker.internet.password(),
    });

    expect(response1.status).toEqual(201);

    const response2 = await request(app).post("/users", {
      email,
      password: faker.internet.password(),
    });

    expect(response2.status).toEqual(400);
  });
});

describe("users.list", () => {
  test("should list users", async () => {
    const app = await createApp();

    await (
      await request(app).post("/users", {
        email: faker.internet.email(),
        password: faker.internet.password(),
      })
    ).expectStatusToBe(201);

    const response = await request(app).get("/users");

    expect(response.status).toEqual(200);

    const data = (await response.json()).users;
    expect(data.length).toBeGreaterThan(0);
  });
});

describe("users.update", () => {
  test("should update user", async () => {
    const app = await createApp();

    await request(app).post("/users", {
      email: "luismi@gmail.es",
      password: "321321321",
      role: "client"
    });

    await (
      await request(app).put("/users", {
        email: "luismi@gmail.es",
        password: "123123123",
        role: "admin",
        user_data: {
          dni: "12345678A",
          name: "Luismi",
          surname: "Palos",
          birthdate: "17/12/2001"
        }
      })).expectStatusToBe(201);
  })
});