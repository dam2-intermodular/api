import { zValidator } from "@hono/zod-validator";
import { Context } from "hono";
import { z } from "zod";
import { User } from "../../../models/user";
import { setCookie } from "hono/cookie";
import { sign } from "hono/jwt";
import { OpenAPIHono, createRoute } from "@hono/zod-openapi";
import { Room } from "../../../models/room";

type BookResponse = {};

export default (app: OpenAPIHono) => {
  app.openapi(
    createRoute({
      method: "post",
      path: "/rooms/:id/book",
      responses: {
        200: {
          description: "Booking successful",
          content: {
            "application/json": {
              schema: z.object({}),
            },
          },
        },
        404: {
          description: "Room not found",
          content: {
            "application/json": {
              schema: z.object({
                error: z.string(),
              }),
            },
          },
        },
      },
    }),
    async function (c: Context): Promise<any> {
      const body = await c.req.json();
      const roomId = c.req.param("id");

      const room = await Room.findOne({
        _id: roomId,
      });

      if (!room) {
        return c.json(
          {
            error: "Room not found",
          },
          404
        );
      }
    }
  );
};
