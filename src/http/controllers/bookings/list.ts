import { OpenAPIHono, createRoute, z } from "@hono/zod-openapi";
import authMiddleware from "../../middlewares/auth";
import employeeMiddleware from "../../middlewares/employee";
import { BookingResourceSchema } from "../../../resources/booking";
import { Context } from "hono";
import { Booking } from "../../../models/booking";
import { createResourceFromDocument } from "../../../mongo";

// Autor: Víctor García Fernández
//
// Esta ruta lista las reservas
// Soporta paginado
export default (app: OpenAPIHono) => {
  app.use("/booking/:id", authMiddleware);
  app.use("/booking/:id", employeeMiddleware);
  app.openapi(
    createRoute({
      method: "get",
      path: "/bookings",
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
          description: "Booking details",
          content: {
            "application/json": {
              schema: z.object({
                bookings: z.array(BookingResourceSchema),
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
      // Se establecerá la paginación personalizada
      // En caso de no haberla, se establecerá por defecto
      const { per_page, page } = c.req.query();
      const perPageParsed = parseInt(per_page) || 10;
      const pageParsed = parseInt(page) || 1;
      const skip = (pageParsed - 1) * perPageParsed;

      // Se realiza la consulta y recoge la respuesta
      const bookings = await Booking.find()
        .skip(skip)
        .limit(perPageParsed)
        .exec();

      // Se mapea la respuesta y se devuelve con
      // el schema de recurso para bookings
      return c.json(
        {
          bookings: bookings.map((booking) =>
            createResourceFromDocument(booking, BookingResourceSchema)
          ),
        },
        200
      );
    }
  );
};
