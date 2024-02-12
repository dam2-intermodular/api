import { Context } from "hono";
import { z } from "zod";
import { OpenAPIHono, createRoute } from "@hono/zod-openapi";
import { createResourceFromDocument } from "../../../mongo";
import { RoomResourceSchema } from "../../../resources/room";
import { Room } from "../../../models/room";

// Autor: Luis Miguel
//
// Esta ruta es para obtener la lista de habitaciones.
// Se retorna un array de habitaciones.
// Se puede filtrar por página y cantidad de habitaciones por página.
export default (app: OpenAPIHono) => {
  app.openapi(
    createRoute({
      method: "get",
      path: "/rooms",
      request: {
        query: z.object({
          per_page: z.string().optional(),
          page: z.string().optional(),
        }),
      },
      responses: {
        200: {
          description: "List rooms",
          content: {
            "application/json": {
              schema: z.object({
                rooms: z.array(RoomResourceSchema),
              }),
            },
          },
        },
      },
    }),
    async function (c: Context): Promise<any> {
      const { per_page, page } = c.req.query();
      const perPageParsed = parseInt(per_page) || 10;
      const pageParsed = parseInt(page) || 1;

      const skip = (pageParsed - 1) * perPageParsed;

      const rooms = await Room.find().skip(skip).limit(perPageParsed).exec();

      return c.json(
        {
          rooms: rooms.map((room) =>
            createResourceFromDocument(room, RoomResourceSchema)
          ),
        },
        200
      );
    }
  );
};
