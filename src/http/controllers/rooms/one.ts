import { Context } from "hono";
import { z } from "zod";
import { OpenAPIHono, createRoute } from "@hono/zod-openapi";
import { Room } from "../../../models/room";

// Autor: Luis Miguel Palos Alhama
//
// Esta ruta recibe un número de una habitación para hacer una query a esa misma habitación, devolviendo así dicha habitación
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

      // Se recoge el número de habitación de la URL y se comprueba que no esté vacía; es decir, que se haya enviado dicho número de habitación
      if (!roomNumber) {
        return c.json(
          {
            message: "No params provided",
          },
          400
        );
      }

      // Se busca la habitación usando su Schema
      const room = await Room.findOne({
        room_number: roomNumber,
      });

      // Se comprueba que se haya encontrado
      if (!room) {
        return c.json(
          {
            message: "Room not found",
          },
          404
        );
      }

      // Se devuelve la habitación
      return c.json(
        {
          room,
        },
        200
      );
    }
  );
};
