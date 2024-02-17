import { Context } from "hono";
import { z } from "zod";
import { Room } from "../../../models/room";
import { OpenAPIHono, createRoute } from "@hono/zod-openapi";
import { RoomResourceSchema } from "../../../resources/room";
import { createResourceFromDocument } from "../../../mongo";

export default (app: OpenAPIHono) => {
  app.openapi(
    createRoute({
      method: "put",
      path: "/room/:room_number",
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
          description: "Room updated",
          content: {
            "application/json": {
              schema: z.object({
                room: RoomResourceSchema,
              }),
            },
          },
        },
        400: {
          description: "Bad request",
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


    async function (c: Context): Promise<any> {
      const body = await c.req.json();


      const room = await Room.findOneAndUpdate({
        _id: c.req.param("room"),
      },
        body,
        {
          new: true,
        }
      );

      if (!room)
        return c.json({
          message: "Room not found",
        },
          404
        );

      return c.json({
        user: createResourceFromDocument(room, RoomResourceSchema),
      },
        201
      );
    }
  );
};
