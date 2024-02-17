import { Context } from "hono";
import { z } from "zod";
import { OpenAPIHono, createRoute } from "@hono/zod-openapi";
import { BookingResourceSchema } from "../../../resources/booking";
import { createResourceFromDocument } from "../../../mongo";
import { Booking } from "../../../models/booking";

export default (app: OpenAPIHono) => {
  app.openapi(
    createRoute({
      method: "put",
      path: "/booking/:id",
      request: {
        body: {
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
      },
      responses: {
        201: {
          description: "Book updated",
          content: {
            "application/json": {
              schema: z.object({
                book: BookingResourceSchema,
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

      const book = await Booking.findOneAndUpdate({
        _id: c.req.param("book"),
      },
        body,
        {
          new: true,
        }
      );

      if (!book)
        return c.json({
          message: "Book not found",
        },
          404
        );

      return c.json({
        user: createResourceFromDocument(book, BookingResourceSchema),
      },
        201
      );
    }
  )
};