import { describe, test, expect, beforeEach } from "bun:test";
import { createApp } from "../src/index";
import { faker } from "@faker-js/faker";
import { getBearerToken, request, login } from "./helpers";
import { User, UserRole } from "../src/models/user";
import { Booking, BookingStatus } from "../src/models/booking";
import { Room } from "../src/models/room";

const app = await createApp();

beforeEach(async () => {
  await User.deleteMany({}).exec();
  await Booking.deleteMany({}).exec();
  await Room.deleteMany({}).exec();
});

describe("bookings", () => {
  test("should update booking", async () => {
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

    const oldBook = (await response.json()).booking;
    expect(oldBook).toBeDefined();

    const response1 = await request(app, loginPayload.token).put(
      `/bookings/${oldBook._id}`,
      {
        status: BookingStatus.CANCELLED,
        check_in_date: new Date().setDate(new Date().getDate() + 10),
        check_out_date: new Date().setDate(new Date().getDate() + 12),
      }
    );
    const response1Body = await response1.json();
    expect(response1.status).toEqual(200);
    expect(response1Body.booking).toBeDefined();
    expect(response1Body.booking.status).toEqual(BookingStatus.CANCELLED);

    const currentRoom = await Room.findOne({ _id: room._id });
    expect(currentRoom!!.availability.length).toEqual(1);
    expect(currentRoom!!.availability[0].check_in_date).not.toEqual(
      oldBook.check_in_date
    );
    expect(currentRoom!!.availability[0].check_out_date).not.toEqual(
      oldBook.check_out_date
    );
  });

  test("should delete booking", async () => {
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

    const body = await response.json();

    const request1 = await request(app, loginPayload.token).delete(
      `/booking/${body.booking._id}`
    );
    expect(request1.status).toEqual(204);

    const currentRoom = await Room.findOne({ _id: room._id });
    expect(currentRoom!!.availability.length).toEqual(0);
  });
});
