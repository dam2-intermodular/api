import { Context } from "hono";
import { z } from "zod";
import { OpenAPIHono, createRoute } from "@hono/zod-openapi";
import { RoomResourceSchema } from "../../../resources/room";
import { Room } from "../../../models/room";

export default (app: OpenAPIHono) => {
  app.openapi(
    createRoute({
      method: "post",
      path: "/room",
      request: {
        body: {
          content: {
            "application/json": {
              schema: z.object({
                room: z.object({
                  _id: z.string(),
                  room_number: z.number(),
                  beds: z.number(),
                  price_per_night: z.number(),
                  image_path: z.string(),
                  description: z.string(),
                  services: z.array(z.string()),
                  createdAt: z.string(),
                  updatedAt: z.string(),
                })
              }),
            },
          },
        },
      },
      responses: {
        201: {
          description: "Room created successfully",
          content: {
            "application/json": {
              schema: z.object({
                room: RoomResourceSchema,
              }),
            },
          },
        },
        400: {
          description: "Invalid data provided",
          content: {
            "application/json": {
              schema: z.object({
                message: z.string(),
              }),
            },
          },
        },
      },
    }),


    async function createRoom(c: Context): Promise<any> {
      try {
        const body = await c.req.json();

        const roomExists = await isRoomExists(body.id);
        if (roomExists) {
          return c.json(
            {
              error: "Room with this id already exists",
            },
            409
          );
        }

        const room = await Room.create(body);

        return c.json({
          room,
          message: "Room created successfully"
        }, 201);
      } catch (error) {
        return c.json(
          {
            message: "Room with this id already exists",
          },
          409
        );
      };

      async function isRoomExists(id: string): Promise<boolean> {
        try {
          const room = await Room.findById(id);
          return !!room;
        } catch (error) {
          console.error("Error: ", error);
          return false;
        }
      }
    }
  )
};