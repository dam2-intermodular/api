import { OpenAPIHono, createRoute, z } from "@hono/zod-openapi";
import { Context } from "hono";

export default (app: OpenAPIHono) => {
  app.openapi(
    createRoute({
      method: "get",
      path: "/ping",
      responses: {
        200: {
          description: "Respond a message",
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
    (c: Context) => {
      return c.json({
        message: "pong",
      });
    }
  );
};
