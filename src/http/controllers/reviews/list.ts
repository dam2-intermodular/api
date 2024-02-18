import { Context } from "hono";
import { z } from "zod";
import { OpenAPIHono, createRoute } from "@hono/zod-openapi";
import { createResourceFromDocument } from "../../../mongo";
import { ReviewResourceSchema } from "../../../resources/review";
import { Review } from "../../../models/review";

// Autora: Lucía Lozano López
//
// Esta ruta devolverá las reviews
// Tiene soporte de paginado
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
      // Se establecerá la paginación personalizada
      // En caso de no haberla, se establecerá por defecto
      const { per_page, page } = c.req.query();
      const perPageParsed = parseInt(per_page) || 10;
      const pageParsed = parseInt(page) || 1;
      const skip = (pageParsed - 1) * perPageParsed;

      // Se realiza la consulta y recoge la respuesta
      const reviews = await Review.find()
        .skip(skip)
        .limit(perPageParsed)
        .exec();

      // Se mapea la respuesta y se devuelve con
      // el schema de recurso para reviews
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
