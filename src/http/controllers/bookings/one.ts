import { Context } from "hono";
import { z } from "zod";
import { OpenAPIHono, createRoute } from "@hono/zod-openapi";
import { Booking } from "../../../models/booking";
import employeeMiddleware from "../../middlewares/employee";
import authMiddleware from "../../middlewares/auth";

// Autor: Lucía Lozano López
//
// Esta ruta recibe un ID para buscar y devolver una reserva específica. Hace uso de los middlewares de autenticación y
// empleado, así asegurando que únicamente empleados y administradores puedan acceder a la ruta
export default (app: OpenAPIHono) => {
  app.use("/booking/:id", authMiddleware);
  app.use("/booking/:id", employeeMiddleware);
  app.openapi(
    createRoute({
      method: "get",
      path: "/booking/:id",
      responses: {
        200: {
          description: "Booking details",
          content: {
            "application/json": {
              schema: z.object({
                _id: z.string(),
                room_id: z.string(),
                user_id: z.string(),
                invoice_id: z.string(),
                check_in_date: z.string(),
                check_out_date: z.string(),
                status: z.string(),
                createdAt: z.string(),
                updatedAt: z.string(),
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
      const bookingId = c.req.param("id");

      // Se recoge el ID de la URL y se comprueba que exista en los parámetros de la URL
      if (!bookingId) {
        return c.json(
          {
            message: "No params provided",
          },
          400
        );
      }

      // Se busca la reserva usando su Schema
      const booking = await Booking.findOne({
        _id: bookingId,
      });

      // Se comprueba si se ha encontrado
      if (!booking) {
        return c.json(
          {
            message: "Booking not found",
          },
          404
        );
      }

      // Se devuelve la reserva
      return c.json(
        {
          booking,
        },
        200
      );
    }
  );
};
