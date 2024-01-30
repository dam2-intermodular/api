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
          description: "User created",
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
      if (!(await isEmailUnique(body.email))) {
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

async function isEmailUnique(email: string): Promise<boolean> {
  const result = await User.findOne({ email });
  return result === null;
}
