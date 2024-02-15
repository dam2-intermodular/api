import { describe, test, expect, beforeEach } from "bun:test";
import { createApp } from "../src/index";
import { login, request } from "./helpers";
import { Review } from "../src/models/review";
import { faker } from "@faker-js/faker";
import { Room } from "../src/models/room";

const app = await createApp();

describe("reviews.create", () => {
  test("should fail validation if body is incomplete", async () => {
    const loginPayload = await login(app);

    const response = await request(app, loginPayload.token).post("/reviews", {
      user_id: "2",
      room_id: "3",
      rating: 4,
      // missing username and review
    });

    expect(response.status).toEqual(400);
  });

  test("should create review", async () => {
    const loginPayload = await login(app);

    const room = await Room.create({
      room_number: 1,
      beds: 2,
      price_per_night: 100,
      image_path: "image",
      description: "description",
      services: ["wifi"],
    });

    const response = await request(app, loginPayload.token).post("/reviews", {
      user_id: loginPayload.user._id,
      room_id: room._id,
      username: faker.internet.userName(),
      room_number: 101,
      rating: 5,
      review: "This room was amazing!",
    });

    expect(response.status).toEqual(201);
  });
});

