import { Context } from "hono";
import { z } from "zod";
import { OpenAPIHono, createRoute } from "@hono/zod-openapi";
import { RoomResourceSchema } from "../../../resources/room";
import { createResourceFromDocument } from "../../../mongo";
import { Room } from "../../../models/room";
import authMiddleware from "../../middlewares/auth";
import adminMiddleware from "../../middlewares/employee";

export default (app: OpenAPIHono) => {
  app.use("/rooms", authMiddleware);
  app.use("/rooms", adminMiddleware);
  app.openapi(
    createRoute({
      method: "post",
      path: "/rooms",
      security: [
        {
          Bearer: [],
        },
      ],
      request: {
        body: {
          content: {
            "application/json": {
              schema: z.object({
                room_number: z.number(),

                beds: z.number(),
                price_per_night: z.number(),

                description: z.string(),
                services: z.array(z.string()),
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
      const body = await c.req.json();

      if (await isRoomNumberUnique(body.room_number)) {
        return c.json(
          {
            error: "Room with this id already exists",
          },
          409
        );
      }

      const room = await Room.create({
        room_number: body.room_number,
        beds: body.beds,
        price_per_night: body.price_per_night,
        description: body.description,
        services: body.services,
      });
      return c.json(
        {
          room: createResourceFromDocument(room, RoomResourceSchema),
        },
        201
      );
    }
  );
};

async function isRoomNumberUnique(number: Number): Promise<boolean> {
  const exists = await Room.exists({ room_number: number });
  return exists !== null;
}

