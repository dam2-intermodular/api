import { zValidator } from "@hono/zod-validator";
import { Context } from "hono";
import { z } from "zod";
import { User } from "../../../models/user";
import { setCookie } from "hono/cookie";
import { sign } from "hono/jwt";
import { OpenAPIHono, createRoute } from "@hono/zod-openapi";

type LoginResponseUser = {
  _id: string;
  email: string;
  role: string;
  createdAt: string;
  updatedAt: string;
};
type LoginResponse = {
  user: LoginResponseUser;
  token: string;
};

// Autor: Victor Garcia
//
// Esta ruta permite loguear un usuario en el sistema.
// Si el usuario y la contraseña son correctos, devuelve un 200, el objeto de usuario y un token de autenticación.
// Ademas, guarda el token en una cookie.
// Si es incorrecto, devuelve un 422.
export default (app: OpenAPIHono) => {
  app.openapi(
    createRoute({
      method: "post",
      path: "/login",
      request: {
        body: {
          content: {
            "application/json": {
              schema: z.object({
                email: z.string().email(),
                password: z.string().min(8).max(255),
              }),
            },
          },
        },
      },
      responses: {
        200: {
          description: "Login successful",
          content: {
            "application/json": {
              schema: z.object({
                user: z.object({
                  _id: z.string(),
                  email: z.string().email(),
                  role: z.string(),
                  createdAt: z.string(),
                  updatedAt: z.string(),
                }),
                token: z.string(),
              }),
            },
          },
        },
        422: {
          description: "Invalid email or password",
          content: {
            "application/json": {
              schema: z.object({
                error: z.string(),
              }),
            },
          },
        },
      },
    }),
    async function (c: Context): Promise<any> {
      if (!Bun.env.JWT_SECRET) {
        throw new Error("JWT_SECRET is not set");
      }

      const body = await c.req.json();

      const user = await User.findOne({
        email: body.email,
      });

      if (!user) {
        return c.json(
          {
            error: "Invalid email or password",
          },
          422
        );
      }

      const passwordValid = await Bun.password.verify(
        body.password,
        user.password
      );

      if (!passwordValid) {
        return c.json(
          {
            error: "Invalid email or password",
          },
          422
        );
      }

      const userPayload = buildUserPayload(user);

      const token = await sign(userPayload, Bun.env.JWT_SECRET);
      setCookie(c, "token", token);

      return c.json(
        {
          user: userPayload,
          token,
        } as LoginResponse,
        200
      );
    }
  );
};

function buildUserPayload(user: any): LoginResponseUser {
  const userJson = user.toJSON();

  const userPayload = {
    _id: userJson._id.toString(),
    email: userJson.email,
    role: userJson.role,
    createdAt: userJson.createdAt?.toISOString(),
    updatedAt: userJson.updatedAt?.toISOString(),
  } as LoginResponseUser;

  return userPayload;
}
