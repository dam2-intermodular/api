import { Context } from "hono";
import { z } from "zod";
import { User, UserRole } from "../../../models/user";
import { OpenAPIHono, createRoute } from "@hono/zod-openapi";
import { UserResourceSchema } from "../../../resources/user";
import { createResourceFromDocument } from "../../../mongo";
import { isEmailOrDniUsed } from "../users/create";

// Autor: Luis Miguel
//
// Esta ruta permite registrar un usuario en el sistema.
// Comprueba que el email y el DNI no estén ya en uso.
// Si no lo están, crea el usuario y devuelve un 201.
export default (app: OpenAPIHono) => {
  app.openapi(
    createRoute({
      method: "post",
      path: "/register",
      request: {
        body: {
          content: {
            "application/json": {
              schema: z.object({
                email: z.string().email(),
                password: z.string().min(8).max(255),
                name: z.string().min(1).max(255),
                surname: z.string().min(1).max(255),
                dni: z.string().min(9).max(9),
              }),
            },
          },
        },
      },
      responses: {
        201: {
          description: "User created successfully",
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
        409: {
          description: "Email or DNI already exists",
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
      if (await isEmailOrDniUsed(body.email, body.dni)) {
        return c.json(
          {
            message: "Email or DNI already exists",
          },
          409
        );
      }

      const hashedPassword = await Bun.password.hash(body.password);
      const userData = {
        name: body.name,
        surname: body.surname,
        dni: body.dni,
      };

      const user = await User.create({
        email: body.email,
        password: hashedPassword,
        user_data: userData,
        role: UserRole.CLIENT,
      });

      return c.json(
        {
          user: createResourceFromDocument(user, UserResourceSchema),
        },
        201
      );
    }
  );
};
