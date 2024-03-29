import { Context } from "hono";
import { z } from "zod";
import { User } from "../../../models/user";
import { OpenAPIHono, createRoute } from "@hono/zod-openapi";
import { UserResourceSchema } from "../../../resources/user";
import { createResourceFromDocument } from "../../../mongo";
import authMiddleware from "../../middlewares/auth";
import employeeMiddleware from "../../middlewares/employee";

// Autor: Víctor García Fernández
//
// Esta ruta listará los usuarios
// Utiliza los middlewares de auth y employee
// Soporta paginación
export default (app: OpenAPIHono) => {
  app.use("/users", authMiddleware);
  app.use("/users", employeeMiddleware);
  app.openapi(
    createRoute({
      method: "get",
      path: "/users",
      security: [
        {
          Bearer: [],
        },
      ],
      request: {
        query: z.object({
          per_page: z.string().optional(),
          page: z.string().optional(),
        }),
      },
      responses: {
        200: {
          description: "List users",
          content: {
            "application/json": {
              schema: z.object({
                users: z.array(UserResourceSchema),
              }),
            },
          },
        },
      },
    }),
    async function (c: Context): Promise<any> {
      // Se establecen las opciones de paginación, o por defecto
      const { per_page, page } = c.req.query();
      const perPageParsed = parseInt(per_page) || 10;
      const pageParsed = parseInt(page) || 1;
      const skip = (pageParsed - 1) * perPageParsed;

      // Se reciben los usuarios con una petición a la base de datos
      const users = await User.find().skip(skip).limit(perPageParsed).exec();

      // Se comprueban los resultados
      if (!users) {
        return c.json(
          {
            message: "Error obtaining users"
          },
          400);
      }
      // Se mapea y devuelven los usuarios usando su ResourceSchema
      return c.json({
        users: users.map((user) =>
          createResourceFromDocument(user, UserResourceSchema)
        ),
      });
    }
  );
};
