import { describe, test, expect, beforeEach } from "bun:test";
import { createApp } from "../src/index";
import { request } from "./helpers";
import { Room } from "../src/models/room";

const app = await createApp();

beforeEach(async () => {
  await Room.deleteMany({}).exec();
});

describe("rooms.create", () => {
  test("should fail validation if body is incomplete", async () => {
    const response = await request(app).post("/reviews", {
      _id: "2",
      room_number: 103,
      beds: 2,
      price_per_night: 123,
      image_path: "sgdfgdfgr",
      // missing rest
    });

    expect(response.status).toEqual(400);
  });
});

describe("rooms.update", () => {
  test("should update room", async () => {
    await Room.updateOne({
      room_number:3,
      beds:2,
      price_per_night:120,
      image_path:"img",
      description:"Good room",
    })

      
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

  test("should show a specific room", async () => {
    //POST /room necesario para crear habitación y seguidamente testear el GET de una forma fiable
    /*TODO*/
  });
});
