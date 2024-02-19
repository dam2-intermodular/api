import { describe, test, expect, beforeEach } from "bun:test";
import { createApp } from "../src/index";
import { login, request } from "./helpers";
import { Room } from "../src/models/room";
import { UserRole } from "../src/models/user";
import { faker } from "@faker-js/faker";

const app = await createApp();

beforeEach(async () => {
  await Room.deleteMany({}).exec();
});

describe("rooms.create", () => {
  test("should create room (may fail if randomly generated room_number already exists)", async () => {
    const loginPayload = await login(app, UserRole.ADMIN);
    const roomNum = faker.number.int({ min: 1, max: 100 });

    const response = await request(app, loginPayload.token).post("/rooms", {
      room_number: roomNum,
      beds: 2,
      price_per_night: 120,
      image_path: "img",
      description: "Good room",
      services: ["wifi"],
    });

    expect(response.status).toEqual(201);
    expect(await response.json()).toEqual({
      room: {
        _id: expect.any(String),
        room_number: roomNum,
        beds: 2,
        price_per_night: 120,
        image_path: null,
        description: "Good room",
        services: ["wifi"],
        updatedAt: null,
        createdAt: expect.any(String),
      },
    });
  });
});

describe("rooms.update", () => {
  test("should update room", async () => {
    await Room.updateOne({
      room_number: 3,
      beds: 2,
      price_per_night: 120,
      image_path: "img",
      description: "Good room",
    });
  });
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
  test("can't book a room if not logged in", async () => {
    const response = await request(app).post(
      `/rooms/65d3b427a8b4aba2c886b38d/book`,
      {
        start: new Date(),
        end: new Date(new Date().setDate(new Date().getDate() + 1)),
      }
    );
    expect(response.status).toEqual(401);
  });

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
