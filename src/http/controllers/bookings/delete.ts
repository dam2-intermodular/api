import { Context } from "hono";
import { z } from "zod";
import { OpenAPIHono, createRoute } from "@hono/zod-openapi";
import { Booking } from "../../../models/booking";
import { Room } from "../../../models/room";
import authMiddleware from "../../middlewares/auth";
import employeeMiddleware from "../../middlewares/employee";

// Autora: Lucía Lozano López
//
// Esta ruta elimina reservas
// Utiliza middlewares de auth y employee
export default (app: OpenAPIHono) => {
  app.use(authMiddleware);
  app.use(employeeMiddleware);
  app.openapi(
    createRoute({
      method: "delete",
      path: "/booking/:id",
      responses: {
        204: {
          description: "Booking deleted successfully",
        },
        404: {
          description: "Booking not found",
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
      // Se busca la reserva por la ID de los parámetros
      // De la URL y la elimina
      const book = await Booking.findByIdAndDelete(c.req.param("id"));
      // Se comprueba si ha funcionado
      if (!book) {
        return c.json(
          {
            message: "Book not found",
          },
          404
        );
      }

      const room = await Room.findById(book.room_id);

      if (!room) {
        return c.json(
          {
            message: "Room not found",
          },
          404
        );
      }

      room.availability.remove({
        booking_id: book._id,
      });
      await room.save();

      // Se devuelve el mensaje correspondiente
      return c.json(
        {
          message: "Book deleted",
        },
        204
      );
    }
  );
};
