import { Context } from "hono";
import authMiddleware from "../../middlewares/auth";
import { OpenAPIHono, createRoute, z } from "@hono/zod-openapi";

export default (app: OpenAPIHono) => {
  app.use("/me", authMiddleware);
  app.openapi(
    createRoute({
      method: "get",
      path: "/me",
      responses: {
        200: {
          description: "Get logged user info",
          content: {
            "application/json": {
              schema: z.object({
                user: z.object({
                  _id: z.string(),
                  email: z.string().email(),
                  role: z.string(),
                  createdAt: z.string(),
                  updatedAt: z.string(),
                }),
              }),
            },
          },
        },
      },
    }),
    (c: Context) => {
      return c.json({
        user: c.get("user"),
      });
    }
  );
};
