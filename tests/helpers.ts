import { HonoBase } from "hono/hono-base";

export function request(app: HonoBase) {
  return {
    get: async (path: string) => {
      const response = await app.request(path, {
        method: "GET",
        headers: {
          "Content-Type": "application/json",
          Accept: "application/json",
        },
      });

      return {
        status: response.status,
        json: async () => {
          return await response.json();
        },
      };
    },
    post: async (path: string, body: object) => {
      const response = await app.request(path, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Accept: "application/json",
        },
        body: JSON.stringify(body),
      });

      return {
        status: response.status,
        json: async () => {
          return await response.json();
        },
      };
    },
  };
}
