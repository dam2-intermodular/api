import { Context } from "hono";
import { z } from "zod";
import { OpenAPIHono, createRoute } from "@hono/zod-openapi";
import { RoomResourceSchema } from "../../../resources/room";
import { createResourceFromDocument } from "../../../mongo";
import { Room } from "../../../models/room";
import authMiddleware from "../../middlewares/auth";
import adminMiddleware from "../../middlewares/employee";

// Autor: Lucía Lozano López
//
// Esta ruta creará una habitación cuyo número de habitación sea único
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

    async function (c: Context): Promise<any> {
      const body = await c.req.json();

      // Se recoge el cuerpo de la petición y comprueba si el número de
      // habitación es único.
      if (await isRoomNumberUnique(body.room_number)) {
        return c.json(
          {
            error: "Room with this number already exists",
          },
          409
        );
      }

      // Se crea la habitación y se guarda el resultado
      const room = await Room.create({
        room_number: body.room_number,
        beds: body.beds,
        price_per_night: body.price_per_night,
        description: body.description,
        services: body.services,
      });

      // Se comprueba que se haya creado correctamente
      if (!room) {
        return c.json(
          {
            message: "Error creating room"
          },
          400)
      }

      // Se devuelve la habitación creada como su recurso
      return c.json(
        {
          room: createResourceFromDocument(room, RoomResourceSchema),
        },
        201
      );
    }
  );
};

// Comprueba que el número de habitación sea único
async function isRoomNumberUnique(number: Number): Promise<boolean> {
  const exists = await Room.exists({ room_number: number });
  return exists == null;
}

