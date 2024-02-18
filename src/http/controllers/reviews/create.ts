import { Context } from "hono";
import { z } from "zod";
import { OpenAPIHono, createRoute } from "@hono/zod-openapi";
import { ReviewResourceSchema } from "../../../resources/review";
import { createResourceFromDocument } from "../../../mongo";
import { Review } from "../../../models/review";
import authMiddleware from "../../middlewares/auth";

// Autora: Lucía Lozano López
//
// Esta ruta permite a los usuarios autenticados crear reviews
export default (app: OpenAPIHono) => {
  app.use("/reviews", authMiddleware);
  app.openapi(
    createRoute({
      method: "post",
      path: "/reviews",
      security: [
        {
          Bearer: [],
        },
      ],
      request: {
        body: {
          content: {
            "application/json": {
              schema: z.object({
                user_id: z.string(),
                username: z.string(),
                room_id: z.string(),
                room_number: z.number(),
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
      // Se recoge el usuario guardado tras iniciar sesión
      const user = c.get("user");

      // Se guarda el cuerpo de la petición en JSON
      // Se establece la ID del usuario el en cuerpo
      const body = await c.req.json();
      body.user_id = user._id;

      // Se crea la review y se guarda la respuesta
      const review = await Review.create(body);

      // Se comprueba que la review haya sido creada
      if (!review) {
        return c.json(
          {
            message: "Error creating review"
          },
          400)
      }

      // Se devuelve la review con su recurso (Schema)
      return c.json(
        {
          review: createResourceFromDocument(review, ReviewResourceSchema),
        },
        201
      );
    }
  );
};