import { Context } from "hono";
import { z } from "zod";
import { OpenAPIHono, createRoute } from "@hono/zod-openapi";
import { createResourceFromDocument } from "../../../mongo";
import { ReviewResourceSchema } from "../../../resources/review";
import { Review } from "../../../models/review";

export default (app: OpenAPIHono) => {
  app.openapi(
    createRoute({
      method: "get",
      path: "/reviews",
      request: {
        query: z.object({
          per_page: z.string().optional(),
          page: z.string().optional(),
        }),
      },
      responses: {
        200: {
          description: "List reviews",
          content: {
            "application/json": {
              schema: z.object({
                reviews: z.array(ReviewResourceSchema),
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

      const reviews = await Review.find()
        .skip(skip)
        .limit(perPageParsed)
        .exec();

      return c.json(
        {
          reviews: reviews.map((review) =>
            createResourceFromDocument(review, ReviewResourceSchema)
          ),
        },
        200
      );
    }
  );
};
