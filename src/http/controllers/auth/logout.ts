import { Context } from "hono";
import { z } from "zod";
import { getSignedCookie, deleteCookie } from "hono/cookie";
import { OpenAPIHono, createRoute } from "@hono/zod-openapi";

// Autor: Luis Miguel
//
// Esta ruta es para cerrar la sesión del usuario.
// Se elimina la cookie de token.
export default (app: OpenAPIHono) => {
  app.openapi(
    createRoute({
      method: "get",
      path: "/logout",
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
