import { Context } from "hono";
import { z } from "zod";
import { OpenAPIHono, createRoute } from "@hono/zod-openapi";
import { Room } from "../../../models/room";

export default (app: OpenAPIHono) => {
  app.openapi(
    createRoute({
      method: "get",
      path: "/room/:room_number",
      responses: {
        200: {
          description: "Room details",
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
                }),
              }),
            },
          },
        },
        404: {
          description: "Not found",
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
      const roomNumber = c.req.param("room_number");

      if (!roomNumber) {
        return c.json(
          {
            message: "No params provided",
          },
          400
        );
      }

      const room = await Room.findOne({
        room_number: roomNumber,
      });

      if (!room) {
        return c.json(
          {
            message: "Room not found",
          },
          404
        );
      }

      return c.json(
        {
          room,
        },
        200
      );
    }
  );
};
