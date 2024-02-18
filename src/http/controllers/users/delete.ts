import { Context } from "hono";
import { z } from "zod";
import { OpenAPIHono, createRoute } from "@hono/zod-openapi";
import { User } from "../../../models/user";
import authMiddleware from "../../middlewares/auth";
import adminMiddleware from "../../middlewares/admin";

// Autora: Lucía Lozano López
//
// Esta ruta recibirá un ID en parámetros y buscará el usuario para eliminarlo.
// Hace uso de los middlewares de autenticación y administración.
export default (app: OpenAPIHono) => {
  app.use("/users/:id", authMiddleware);
  app.use("/users/:id", adminMiddleware);
  app.openapi(
    createRoute({
      method: "delete",
      path: "/users/:id",
      security: [
        {
          Bearer: [],
        },
      ],
      responses: {
        204: {
          description: "User deleted successfully",
        },
        404: {
          description: "User not found",
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
      const id = c.req.param("id");

      // Se recoge el ID de la URL y se comprueba que exista en los parámetros de la URL
      if (!id) {
        return c.json({
          message: "No params provided"
        },
          400
        );
      }

      // Se busca por su ID y se elimina, devolviendo el usuario eliminado
      const user = await User.findByIdAndDelete({
        _id: id,
      });

      // Se comprueba que se haya eliminado
      if (!user) {
        return c.json(
          {
            message: "User not found",
          },
          404
        );
      }

      // Se devuelve un código 204 para indicar éxito
      return c.json(
        {
          message: "User deleted",
        },
        204
      );
    }
  );
};
