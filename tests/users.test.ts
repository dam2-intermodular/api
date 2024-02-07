import { describe, test, expect } from "bun:test";
import { createApp } from "../src/index";
import { faker } from "@faker-js/faker";
import { getAdminBearerToken, request } from "./helpers";
import { User } from "../src/models/user";

const app = await createApp();
const adminToken = await getAdminBearerToken(app);

describe("users.create", () => {
  test("should fail validation if body is incomplete", async () => {
    const response = await request(app, adminToken).post("/users", {
      name: "John Doe",
      // missing email and password
    });

    expect(response.status).toEqual(400);
  });

  test("should create user", async () => {
    const response = await request(app, adminToken).post("/users", {
      email: faker.internet.email(),
      password: faker.internet.password(),
      user_data: {
        name: faker.person.fullName(),
        dni: faker.lorem.word({ length: { min: 9, max: 9 } }),
      },
    });

    expect(response.status).toEqual(201);

    const data = (await response.json()).user;
    const success = await User.findOne({ _id: data._id }).exec();

    expect(success?.email).toBe(data.email);
  });

  test("should check that email and dni don't exist", async () => {
    const email = faker.internet.email();
    const dni = faker.lorem.word({length({min: 9, max: 9})});

    const response1 = await request(app, adminToken).post("/users", {
      email,
      password: faker.internet.password(),
      user_data: {
        dni,
      },
    });
    expect(response1.status).toEqual(201);

    const response2 = await request(app, adminToken).post("/users", {
      email,
      password: faker.internet.password(),
      user_data: {
        dni: "32132132A",
      },
    });
    expect(response2.status).toEqual(400);

    const response3 = await request(app, adminToken).post("/users", {
      email: faker.internet.email,
      password: faker.internet.password(),
      user_data: {
        dni,
      },
    });
    expect(response3.status).toEqual(400);
  });
});

describe("users.list", () => {
  test("should list users", async () => {
    await (
      await request(app, adminToken).post("/users", {
        email: faker.internet.email(),
        password: faker.internet.password(),
      })
    ).expectStatusToBe(201);

    const response = await request(app, adminToken).get("/users");

    expect(response.status).toEqual(200);

    const data = (await response.json()).users;
    expect(data.length).toBeGreaterThan(0);
  });
});

describe("users.update", () => {
  test("should update user", async () => {
    const user = (
      await (
        await request(app, adminToken).post("/users", {
          email: faker.internet.email(),
          password: faker.internet.password(),
        })
      ).json()
    ).user;

    await (
      await request(app, adminToken).put(`/users/${user._id}`, {
        email: "luismi@gmail.es",
        password: "123123123",
        role: "admin",
        user_data: {
          dni: "12345678A",
          name: "Luismi",
          surname: "Palos",
          birthdate: "17/12/2001",
        },
      })
    ).expectStatusToBe(201);
  });
});

describe("users.delete", () => {
  test("should delete user", async () => {
    const user = (
      await (
        await request(app, adminToken).post("/users", {
          email: faker.internet.email(),
          password: faker.internet.password(),
        })
      ).json()
    ).user;

    await (
      await request(app, adminToken).delete(`/users/${user._id}`)
    ).expectStatusToBe(200);
  });
});
