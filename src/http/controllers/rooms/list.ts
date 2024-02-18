import { Context } from "hono";
import { z } from "zod";
import { OpenAPIHono, createRoute } from "@hono/zod-openapi";
import { createResourceFromDocument } from "../../../mongo";
import { RoomResourceSchema } from "../../../resources/room";
import { Room } from "../../../models/room";

// Autor: Víctor García López
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
          beds: z.coerce.number().optional(),
          from: z.coerce.date().optional(),
          to: z.coerce.date().optional(),
        }),
      },
      responses: {
        200: {
          description: "List rooms",
          content: {
            "application/json": {
              schema: z.object({
                rooms: z.array(RoomResourceSchema),
                meta: z.object({
                  total: z.number(),
                  per_page: z.number(),
                  page: z.number(),
                }),
              }),
            },
          },
        },
      },
    }),
    async function (c: Context): Promise<any> {
      // Se establece la paginación especificada o por defecto
      const { per_page, page } = c.req.query();
      const perPageParsed = parseInt(per_page) || 10;
      const pageParsed = parseInt(page) || 1;
      const skip = (pageParsed - 1) * perPageParsed;

      // Se crea un objeto de filtros
      const filters: any = {};
      //Se comprueban los filtros para añadirlos
      if (c.req.query("beds")) {
        filters["beds"] = {
          $gte: c.req.query("beds"),
        };
      }
      //Se comprueban los filtros para añadirlos
      if (c.req.query("from") && c.req.query("to")) {
        filters["reservations"] = {
          $not: {
            $elemMatch: {
              from: { $gte: c.req.query("to") },
              to: { $lte: c.req.query("from") },
            },
          },
        };
      }
      // Se buscan las habitaciones con los filtros y paginaciones
      const rooms = await Room.find(filters)
        .skip(skip)
        .limit(perPageParsed)
        .exec();
      // Se comprueban los resultados
      if (!rooms) {
        return c.json(
          {
            message: "Error obtaining rooms"
          },
          400
        );
      }
      // Se mapean y devuelven los resultados paginados
      return c.json(
        {
          rooms: rooms.map((room) =>
            createResourceFromDocument(room, RoomResourceSchema)
          ),
          meta: {
            total: await Room.countDocuments(),
            per_page: perPageParsed,
            page: pageParsed,
          },
        },
        200
      );
    }
  );
};
