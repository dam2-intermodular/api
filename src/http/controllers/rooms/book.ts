import { Context } from "hono";
import { z } from "zod";
import { OpenAPIHono, createRoute } from "@hono/zod-openapi";
import { Room } from "../../../models/room";
import { Booking } from "../../../models/booking";
import authMiddleware from "../../middlewares/auth";

// Autor: Víctor García Fernández
//
// Esta ruta con el middleware de autenticación, permite a los usuarios reservar una habitación.
// Se valida que la fecha de inicio sea menor a la fecha de fin y que la fecha de inicio sea en el futuro.
// Se validan todos los rangos posibles que puedan coincidir con reservas ya existentes.
// Si la habitación no está disponible, se devuelve un error 404.
// Si la habitación está disponible, se crea una reserva y se actualiza la disponibilidad de la habitación.
// Se devuelve la reserva creada.
export default (app: OpenAPIHono) => {
  app.use("/rooms/:id/book", authMiddleware);
  app.openapi(
    createRoute({
      method: "post",
      path: "/rooms/:id/book",
      security: [
        {
          Bearer: [],
        },
      ],
      request: {
        body: {
          content: {
            "application/json": {
              schema: z
                .object({
                  start: z.coerce.date(),
                  end: z.coerce.date(),
                })
                .refine((data) => data.start < data.end, {
                  message: "Start date should be before end date",
                })
                .refine(
                  (data) =>
                    data.start >
                    new Date(new Date().setDate(new Date().getDate() - 1)),
                  {
                    message: "Start date should be in the future",
                  }
                ),
            },
          },
        },
      },
      responses: {
        200: {
          description: "Booking successful",
          content: {
            "application/json": {
              schema: z.object({
                booking: z.object({
                  _id: z.string(),
                  room_id: z.string(),
                  user_id: z.string(),
                  check_in_date: z.date(),
                  check_out_date: z.date(),
                  createdAt: z.date(),
                  updatedAt: z.date().nullable(),
                }),
              }),
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
      // Se recogen el cuerpo, la id de parámetros de la URL
      // y el usuario autenticado
      const body = await c.req.json();
      const roomId = c.req.param("id");
      const user = c.get("user");

      if (roomId == null || user == null) {
        return c.json(
          {
            message: "Params not provided or user not found"
          },
          400
        );
      }
      // Se busca si la habitación está libre durante el rango de la petición
      // La siguiente query cubre todos los rangos que puedan coincidir
      // Al obligar que la habitación a devolver no tenga:
      // Fecha de entrada anterior a la fecha de salida de la petición
      // **Y**
      // Fecha de salida posterior a la fecha de entrada de la petición
      // Esta query $not excluye la habitación si no está libre
      // durante el rango de fechas de la petición
      const room = await Room.findOne({
        _id: roomId,
        availability: {
          $not: {
            $elemMatch: {
              check_in_date: {
                $lt: body.end,
              },
              check_out_date: {
                $gt: body.start,
              },
            },
          },
        },
      });
      // Si la habitación no está disponible, se devuelve un 404
      if (!room) {
        return c.json(
          {
            error: "Room not found",
          },
          404
        );
      }
      // Se crea la reserva
      const booking = Booking.create({
        room_id: room._id,
        user_id: user._id,
        check_in_date: body.start,
        check_out_date: body.end,
      });

      if (!booking) {
        return c.json(
          {
            message: "Error creating the booking"
          },
          400
        )
      }
      // Se guarda el rango de fechas reservado en la habitación
      room.availability.push({
        check_in_date: body.start,
        check_out_date: body.end,
      });
      await room.save();
      // Se devuelve la reserva creada
      return c.json({
        booking,
      },
        200);
    }
  );
};
