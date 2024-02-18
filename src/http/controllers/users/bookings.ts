import { Context } from "hono";
import { z } from "zod";
import { OpenAPIHono, createRoute } from "@hono/zod-openapi";
import { createResourceFromDocument } from "../../../mongo";
import authMiddleware from "../../middlewares/auth";
import { Booking } from "../../../models/booking";
import { BookingResourceSchema } from "../../../resources/booking";

// Autor: Victor Garcia
//
// Esta ruta permite listar las reservas que ha hecho un usuario.
// Esta protegida por autenticación.
// Devuelve un 200 y un array de reservas.
// Si no hay reservas, devuelve un array vacío.
// Soporta la paginación. Por defecto, devuelve 10 reservas por página. Y puedes especificar la página con el parámetro "page".
export default (app: OpenAPIHono) => {
  app.use("/users/bookings", authMiddleware);
  app.openapi(
    createRoute({
      method: "get",
      path: "/users/bookings",
      security: [
        {
          Bearer: [],
        },
      ],
      request: {
        query: z.object({
          per_page: z.string().optional(),
          page: z.string().optional(),
        }),
      },
      responses: {
        200: {
          description: "List bookings a given user has made",
          content: {
            "application/json": {
              schema: z.object({
                bookings: z.array(BookingResourceSchema),
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

      const userId = c.get("user")._id;

      const bookings = await Booking.find({ user_id: userId })
        .skip(skip)
        .limit(perPageParsed)
        .exec();

      return c.json({
        bookings: bookings.map((booking) =>
          createResourceFromDocument(booking, BookingResourceSchema)
        ),
      });
    }
  );
};
