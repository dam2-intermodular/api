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
      if (await isEmailUsed(body.email)) {
        return c.json(
          {
            message: "Email already exists",
          },
          400
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

async function isEmailUsed(email: string): Promise<boolean> {
  return new Promise((resolve) => {
    User.exists({ email }).then((exists) => {
      resolve(exists !== null);
    });
  });
}
