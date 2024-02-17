import { describe, test, expect, beforeEach } from "bun:test";
import { createApp } from "../src/index";
import { request } from "./helpers";
import { faker } from "@faker-js/faker";
import { Booking } from "../src/models/booking";

const app = await createApp();

describe("rooms.update", () => {
    test("should update book", async () => {
      await Booking.updateOne({
        room_id: "12432",
        user_id: "32d",
        invoice_id: "321",
        check_in_date: "10/10/2024",
        check_out_date: "15/10/2024",
        status: "COMPLETE",
        createdAt: "aw",
        updatedAt: "aq",
      })
  
        
    });
});

describe("books.delete", () => {
    test("should delete book", async () => {
      const book = (
        await (
          await request(app).post("/books", {
            number: faker.number,
          })
        ).json()
      ).book;
  
      await (
        await request(app).delete(`/books/${book._id}`)
      ).expectStatusToBe(200);
    });
  });