import { Context } from "hono";
import { z } from "zod";
import { User } from "../../../models/user";
import { OpenAPIHono, createRoute } from "@hono/zod-openapi";
import { UserResourceSchema } from "../../../resources/user";
import { createResourceFromDocument } from "../../../mongo";
import authMiddleware from "../../middlewares/auth";
import employeeMiddleware from "../../middlewares/employee";

// Autor: Luis Miguel
//
// Esta ruta permite actualizar un usuario en el sistema.
export default (app: OpenAPIHono) => {
  app.use("/users/:id", authMiddleware);
  app.use("/users/:id", employeeMiddleware);
  app.openapi(
    createRoute({
      method: "put",
      path: "/users/:id",
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
                password: z.string().min(8).max(255).optional(),
                user_data: z.any().optional(),
                role: z.string().optional(),
              }),
            },
          },
        },
      },
      responses: {
        201: {
          description: "User updated",
          content: {
            "application/json": {
              schema: z.object({
                user: UserResourceSchema,
              }),
            },
          },
        },
        400: {
          description: "Bad request",
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

      // Se comprobará si el usuario ha introducido una contraseña para saber si se desea cambiar. En caso de existir, pero estar vacía, se dará un error
      if (body.password !== undefined) {
        if (body.password === "")
          return c.json(
            {
              message: "Password cannot be empty",
            },
            400
          );

        body.password = await Bun.password.hash(body.password);
      }

      // Se buscará el usuario por su ID y se actualizará, añadiendo "new: true" para que se devuelva el usuario actualizado
      const user = await User.findOneAndUpdate(
        {
          _id: c.req.param("id"),
        },
        body,
        {
          new: true,
        }
      );

      // En caso de no haberse encontrado dicho usuario, "user" estará vacío, por lo que se devolverá un código 404
      if (!user)
        return c.json(
          {
            message: "User not found",
          },
          404
        );

      // En caso de haberse encontrado, se devolverá el usuario usando su recurso sin contraseña
      return c.json(
        {
          user: createResourceFromDocument(user, UserResourceSchema),
        },
        201
      );
    }
  );
};
