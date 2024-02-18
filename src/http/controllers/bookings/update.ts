import { Context } from "hono";
import { z } from "zod";
import { OpenAPIHono, createRoute } from "@hono/zod-openapi";
import { BookingResourceSchema } from "../../../resources/booking";
import { createResourceFromDocument } from "../../../mongo";
import { Booking } from "../../../models/booking";
import authMiddleware from "../../middlewares/auth";
import employeeMiddleware from "../../middlewares/employee";
import { Room } from "../../../models/room";

// Autora: Lucía Lozano López
//
// Esta ruta es para actualizar reservas
// Usa authmiddleware y employeemiddleware
export default (app: OpenAPIHono) => {
  app.use(authMiddleware);
  app.use(employeeMiddleware);
  app.openapi(
    createRoute({
      method: "put",
      path: "/bookings/:id",
      request: {
        body: {
          content: {
            "application/json": {
              schema: z.object({
                room_id: z.string().optional(),
                user_id: z.string().optional(),
                invoice_id: z.string().optional(),
                check_in_date: z.coerce.date().optional(),
                check_out_date: z.coerce.date().optional(),
                status: z.string().optional(),
              }),
            },
          },
        },
      },
      responses: {
        201: {
          description: "Book updated",
          content: {
            "application/json": {
              schema: z.object({
                booking: BookingResourceSchema,
              }),
            },
          },
        },
        400: {
          description: "Bad request",
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

      const oldBook = await Booking.findOne({
        _id: c.req.param("id"),
      });
      if (!oldBook) {
        return c.json(
          {
            message: "Book not found",
          },
          404
        );
      }

      if (body.room_id || body.check_in_date || body.check_out_date) {
        await moveAvailability(
          oldBook,
          body.room_id ?? oldBook.room_id,
          body.check_in_date ?? oldBook.check_in_date,
          body.check_out_date ?? oldBook.check_out_date
        );
      }

      const book = await Booking.findOneAndUpdate(
        { _id: c.req.param("id") },
        {
          ...body,
          updatedAt: new Date(),
        },
        {
          new: true,
        }
      );

      // Se devuelve la reserva actualizada
      return c.json(
        {
          booking: createResourceFromDocument(book, BookingResourceSchema),
        },
        200
      );
    }
  );
};

async function moveAvailability(
  oldBook: any,
  newRoomId: string,
  checkInDate: Date,
  checkOutDate: Date
) {
  const oldRoom = await Room.findById(oldBook.room_id);
  const newRoom = await Room.findById(newRoomId);

  if (!oldRoom || !newRoom) {
    return;
  }

  oldRoom.availability.remove({
    booking_id: oldBook._id,
  });

  newRoom.availability.push({
    check_in_date: checkInDate,
    check_out_date: checkOutDate,
    booking_id: oldBook._id,
  });

  await oldRoom.save();
  await newRoom.save();

  oldBook.room_id = newRoomId;
  await oldBook.save();
}

