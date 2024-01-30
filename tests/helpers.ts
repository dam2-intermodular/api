import { describe, test, expect } from "bun:test";
import { HonoBase } from "hono/hono-base";

export function request(app: HonoBase) {
  return {
    get: async (path: string, options = {}) => {
      const response = await app.request(path, {
        method: "GET",
        headers: {
          "Content-Type": "application/json",
          Accept: "application/json",
        },
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
    },
    post: async (path: string, body: object, options = {}) => {
      const response = await app.request(path, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Accept: "application/json",
        },
        ...options,
        body: JSON.stringify(body),
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
    },
    put: async (path: string, body: object, options = {}) => {
      const response = await app.request(path, {
        method: "PUT",
        headers: {
          "Content-Type": "application/json",
          Accept: "application/json",
        },
        ...options,
        body: JSON.stringify(body),
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
    },
  };
}
