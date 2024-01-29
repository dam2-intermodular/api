import { Context } from "hono";
import { z } from "zod";
import { User } from "../../../models/user";
import { OpenAPIHono, createRoute } from "@hono/zod-openapi";

export default (app: OpenAPIHono) => {
  app.openapi(
    createRoute({
      method: "post",
      path: "/users",
      request: {
        body: {
          content: {
            "application/json": {
              schema: z.object({
                name: z.string().min(3).max(255),
                email: z.string().email(),
                password: z.string().min(8).max(255),
              }),
            },
          },
        },
      },
      responses: {
        201: {
          description: "User created",
          content: {
            "application/json": {
              schema: z.object({
                user: z.object({
                  name: z.string(),
                  email: z.string().email(),
                }),
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
      if (!(await isEmailUnique(body.email))) {
        return c.json(
          {
            message: "El email ya existe en la base de datos",
          },
          400
        );
      }

      const hashedPassword = await Bun.password.hash(body.password);

      const user = await User.create({
        name: body.name,
        email: body.email,
        password: hashedPassword,
      });

      return c.json(
        {
          user,
        },
        201
      );
    }
  );
};

async function isEmailUnique(email: string): Promise<boolean> {
  const result = await User.findOne({ email });
  return result === null;
}
