import { describe, test, expect } from "bun:test";
import { HonoBase } from "hono/hono-base";
import { User, UserRole } from "../src/models/user";
import { faker } from "@faker-js/faker";

export function request(app: HonoBase, token: string | null = null) {
  const request = async (
    method: string,
    path: string,
    options: RequestInit
  ) => {
    const headers = {
      "Content-Type": "application/json",
      Accept: "application/json",
    } as any;

    if (token) {
      headers.Authorization = `Bearer ${token}`;
    }

    const response = await app.request(path, {
      method: method.toUpperCase(),
      headers,
      ...options,
    });

    return {
      status: response.status,
      json: async () => {
        return await response.json();
      },
      expectStatusToBe: async (status: number) => {
        return expect(response.status).toBe(status);
      },
    };
  };

  return {
    get: (path: string, options = {}) => {
      return request("GET", path, options);
    },
    post: (path: string, body: object, options = {}) => {
      return request("POST", path, {
        body: JSON.stringify(body),
        ...options,
      });
    },
    put: (path: string, body: object, options = {}) => {
      return request("PUT", path, {
        body: JSON.stringify(body),
        ...options,
      });
    },
    delete: (path: string, options = {}) => {
      return request("DELETE", path,
        options,
      );
    },
  };
}

export async function getAdminBearerToken(app: HonoBase) {
  const password = faker.internet.password();
  const user = await User.create({
    email: faker.internet.email(),
    password: await Bun.password.hash(password),
    role: UserRole.ADMIN,
  });
  return getBearerToken(app, {
    email: user.email,
    password,
  });
}

export async function getBearerToken(
  app: HonoBase,
  user: { email: string; password: string }
) {
  const response = await request(app).post("/login", {
    email: user.email,
    password: user.password,
  });

  expect(response.status).toEqual(200);
  return (await response.json()).token;
}
