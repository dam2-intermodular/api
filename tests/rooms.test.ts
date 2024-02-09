import { describe, test, expect, beforeEach } from "bun:test";
import { createApp } from "../src/index";
import { request } from "./helpers";
import { Room } from "../src/models/room";

const app = await createApp();

beforeEach(async () => {
  await Room.deleteMany({}).exec();
});

describe("rooms.list", () => {
  test("should list rooms", async () => {
    await Room.create({
      room_number: 1,
      beds: 2,
      price_per_night: 100,
      image_path: "image",
      description: "description",
      services: ["wifi"],
    });

    const response = await request(app).get("/rooms");
    expect(response.status).toEqual(200);
    expect(await response.json()).toEqual({
      rooms: [
        {
          _id: expect.any(String),
          beds: 2,
          price_per_night: 100,
          image_path: "image",
          description: "description",
          services: ["wifi"],
          updatedAt: null,
          createdAt: expect.any(String),
        },
      ],
    });
  });

  test("should paginate rooms", async () => {
    for (let i = 0; i < 20; i++) {
      await Room.create({
        room_number: i + 2,
        beds: 2,
        price_per_night: 100,
        image_path: "image",
        description: "description",
        services: ["wifi"],
      });
    }

    const response = await request(app).get("/rooms");
    expect(response.status).toEqual(200);
    expect((await response.json()).rooms.length).toEqual(10);
  });
});
