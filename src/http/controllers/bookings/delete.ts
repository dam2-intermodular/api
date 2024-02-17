import { Context } from "hono";
import { z } from "zod";
import { OpenAPIHono, createRoute } from "@hono/zod-openapi";
import { Booking } from "../../../models/booking";

export default (app: OpenAPIHono) => {
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
      const book = await Booking.findByIdAndDelete(
        {
          _id: c.req.param("id"),
        },
      );

      if (!book) {
        return c.json(
          {
            message: "Book not found",
          },
          404
        );
      }
      return c.json(
        {
          message: "Book deleted",
        },
        200
      );
    }
  );
  
};