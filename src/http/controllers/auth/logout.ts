import { Context } from "hono";
import { z } from "zod";
import { getSignedCookie, deleteCookie } from "hono/cookie";
import { OpenAPIHono, createRoute } from "@hono/zod-openapi";
import authMiddleware from "../../middlewares/auth";

// Autor: Luis Miguel
//
// Esta ruta es para cerrar la sesión del usuario.
export default (app: OpenAPIHono) => {
  app.use("/logout", authMiddleware);
  app.openapi(
    createRoute({
      method: "get",
      path: "/logout",
      security: [
        {
          Bearer: [],
        },
      ],
      responses: {
        200: {
          description: "Logout successful",
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
      // Se elimina la cookie de token.
      deleteCookie(c, "token");
      return c.json(
        {
          message: "Logout successful",
        },
        200
      );
    }
  );
};
