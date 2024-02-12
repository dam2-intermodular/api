import { describe, test, expect, beforeEach } from "bun:test";
import { createApp } from "../src/index";
import { request } from "./helpers";
import { Review } from "../src/models/review";
import { faker } from "@faker-js/faker";

const app = await createApp();

describe("reviews.create", () => {
  test("should fail validation if body is incomplete", async () => {
    const response = await request(app).post("/reviews", {
      user_id: "2",
      room_id: "3",
      rating: 4,
      // missing username and review
    });

    expect(response.status).toEqual(400);
  });

  test("should create review", async () => {
    const response = await request(app).post("/reviews", {
      user_id: "23",
      username: faker.internet.userName(),
      room_id: "3",
      room_name: "Room 101",
      rating: 5,
      review: "This room was amazing!",
    });

    expect(response.status).toEqual(201);
  });
});