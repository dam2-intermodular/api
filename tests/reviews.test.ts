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
        username: faker.person.firstName,
        room_id: "3",
        room_name: "Room 101",
        rating: 5,
        review: "This room was amazing!",
      });
  
      expect(response.status).toEqual(201);
  
      const data = (await response.json()).review;
      const success = await Review.findOne({ _id: data._id }).exec();
  
      expect(success?.user_id).toBe(data.user_id);
      expect(success?.room_id).toBe(data.room_id);
      // Verifica otros campos según sea necesario
    });
  
    test("should check that review doesn't already exist", async () => {
      // Crea una reseña inicialmente
      const response1 = await request(app).post("/reviews", {
        user_id: "user_id_here",
        username: "John Doe",
        room_id: "room_id_here",
        room_name: "Room 101",
        rating: 5,
        review: "This room was amazing!",
      });
      expect(response1.status).toEqual(201);
  
      // Intenta crear una reseña con los mismos user_id y room_id
      const response2 = await request(app).post("/reviews", {
        user_id: "user_id_here",
        username: "John Doe",
        room_id: "room_id_here",
        room_name: "Room 101",
        rating: 4,
        review: "This room was okay.",
      });
      expect(response2.status).toEqual(409);
  
      
    });
  });