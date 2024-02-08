import { Context } from "hono";
import { z } from "zod";
import { User, UserRole } from "../../../models/user";
import { OpenAPIHono, createRoute } from "@hono/zod-openapi";
import { UserResourceSchema } from "../../../resources/user";
import { createResourceFromDocument } from "../../../mongo";

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
                email: z.string().email(),
                password: z.string().min(8).max(255),
                user_data: z.any().optional().default({}),
                role: z.string().optional().default(UserRole.CLIENT),
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
          description: "Email already exists",
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

      if (await isEmailOrDniUsed(body.email, body.user_data?.dni)) {
        return c.json(
          {
            message: "Email or DNI already exists",
          },
          409
        );
      }

      const hashedPassword = await Bun.password.hash(body.password);

      const user = await User.create({
        user_data: body.user_data,
        email: body.email,
        password: hashedPassword,
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

export async function isEmailOrDniUsed(
  email: string | null = null,
  dni: string | null = null
): Promise<boolean> {
  return new Promise((resolve) => {
    const or = [];

    if (email) {
      or.push({ email });
    }

    if (dni) {
      or.push({ "user_data.dni": dni });
    }

    User.exists({ $or: or }).then((exists) => {
      resolve(exists !== null);
    });
  });
}
