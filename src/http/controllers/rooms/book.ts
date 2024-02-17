import { Context } from "hono";
import { z } from "zod";
import { OpenAPIHono, createRoute } from "@hono/zod-openapi";
import { Room } from "../../../models/room";
import { Booking } from "../../../models/booking";
import authMiddleware from "../../middlewares/auth";
import { isValidObjectId } from "mongoose";

// Autor: Victor Garcia
//
// Esta ruta con el middleware de autenticación, permite a los usuarios reservar una habitación.
// Se valida que la fecha de inicio sea menor a la fecha de fin y que la fecha de inicio sea en el futuro.
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
      const body = await c.req.json();
      const roomId = c.req.param("id");

      if (!isValidObjectId(roomId)) {
        return c.json(
          {
            error: "Invalid room id",
          },
          404
        );
      }

      const user = c.get("user");

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

      if (!room) {
        return c.json(
          {
            error: "Room not found",
          },
          404
        );
      }

      const booking = Booking.create({
        room_id: room._id,
        user_id: user._id,
        check_in_date: body.start,
        check_out_date: body.end,
      });

      room.availability.push({
        check_in_date: body.start,
        check_out_date: body.end,
      });
      await room.save();

      return c.json({
        booking,
      });
    }
  );
};
