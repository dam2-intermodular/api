import { describe, test, expect } from "bun:test";
import { createApp } from "../src";

describe("ping", () => {
  test("should return pong", async () => {
    const app = await createApp();

    const response = await app.request("/ping");

    expect(response.status).toBe(200);
    expect(await response.json()).toEqual({
      message: "pong",
    } as any);
  });
});
