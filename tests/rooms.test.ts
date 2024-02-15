import { describe, test, expect, beforeEach } from "bun:test";
import { createApp } from "../src/index";
import { login, request } from "./helpers";
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
          room_number: expect.any(Number),
          beds: 2,
          price_per_night: 100,
          image_path: "image",
          description: "description",
          services: ["wifi"],
          updatedAt: null,
          createdAt: expect.any(String),
        },
      ],
      meta: {
        total: 1,
        per_page: 10,
        page: 1,
      },
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

  test("should show a specific room", async () => {
    //POST /room necesario para crear habitación y seguidamente testear el GET de una forma fiable
    /*TODO*/
  });
});

describe("rooms.book", () => {
  test("should book a room", async () => {
    const loginPayload = await login(app);

    const room = await Room.create({
      room_number: 1,
      beds: 2,
      price_per_night: 100,
      image_path: "image",
      description: "description",
      services: ["wifi"],
    });

    const response = await request(app, loginPayload.token).post(
      `/rooms/${room._id}/book`,
      {
        start: new Date(),
        end: new Date(new Date().setDate(new Date().getDate() + 1)),
      }
    );

    expect(response.status).toEqual(200);
  });

  test("should not book a room if it's not available", async () => {
    const loginPayload = await login(app);

    const room = await Room.create({
      room_number: 1,
      beds: 2,
      price_per_night: 100,
      image_path: "image",
      description: "description",
      services: ["wifi"],
      availability: [
        {
          check_in_date: new Date(
            new Date().setDate(new Date().getDate() + 10)
          ).toISOString(),
          check_out_date: new Date(
            new Date().setDate(new Date().getDate() + 20)
          ).toISOString(),
        },
      ],
    });

    const response = await request(app, loginPayload.token).post(
      `/rooms/${room._id}/book`,
      {
        start: new Date(new Date().setDate(new Date().getDate() + 11)),
        end: new Date(new Date().setDate(new Date().getDate() + 12)),
      }
    );

    expect(response.status).toEqual(404);
  });

  test("should not book a room if start date is after end date", async () => {
    const loginPayload = await login(app);

    const room = await Room.create({
      room_number: 1,
      beds: 2,
      price_per_night: 100,
      image_path: "image",
      description: "description",
      services: ["wifi"],
    });

    const response = await request(app, loginPayload.token).post(
      `/rooms/${room._id}/book`,
      {
        start: new Date(new Date().setDate(new Date().getDate() + 1)),
        end: new Date(),
      }
    );

    expect(response.status).toEqual(400);
  });

  test("should not book a room if start date is in the past", async () => {
    const loginPayload = await login(app);

    const room = await Room.create({
      room_number: 1,
      beds: 2,
      price_per_night: 100,
      image_path: "image",
      description: "description",
      services: ["wifi"],
    });

    const response = await request(app, loginPayload.token).post(
      `/rooms/${room._id}/book`,
      {
        start: new Date(new Date().setDate(new Date().getDate() - 1)),
        end: new Date(),
      }
    );

    expect(response.status).toEqual(400);
  });
});
