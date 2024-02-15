import { Context } from "hono";
import { z } from "zod";
import { OpenAPIHono, createRoute } from "@hono/zod-openapi";
import { ReviewResourceSchema } from "../../../resources/review";
import { createResourceFromDocument } from "../../../mongo";
import { Review } from "../../../models/review";
import authMiddleware from "../../middlewares/auth";

export default (app: OpenAPIHono) => {
  app.use("/reviews", authMiddleware);
  app.openapi(
    createRoute({
      method: "post",
      path: "/reviews",
      request: {
        body: {
          content: {
            "application/json": {
              schema: z.object({
                user_id: z.string(),
                username: z.string(),
                room_id: z.string(),
                rating: z.number().int().min(1).max(5),
                review: z.string().max(500).optional().default(""),
              }),
            },
          },
        },
      },
      responses: {
        201: {
          description: "Review created successfully",
          content: {
            "application/json": {
              schema: z.object({
                review: ReviewResourceSchema,
              }),
            },
          },
        },
        400: {
          description: "Invalid data provided",
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

      const review = await Review.create({
        user_id: body.user_id,
        room_id: body.room_id,
        username: body.username,
        rating: body.rating,
        review: body.review,
      });

      return c.json(
        {
          review: createResourceFromDocument(review, ReviewResourceSchema),
        },
        201
      );
    }
  );
};

