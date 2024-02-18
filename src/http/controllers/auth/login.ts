import { zValidator } from "@hono/zod-validator";
import { Context } from "hono";
import { z } from "zod";
import { User } from "../../../models/user";
import { setCookie } from "hono/cookie";
import { sign } from "hono/jwt";
import { OpenAPIHono, createRoute } from "@hono/zod-openapi";

// Tipamos la respuesta que devolverá la ruta.
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
    // Definimos los datos de la ruta. Como el método, ruta validación de la petición y ejemplos de respuestas.
    // Esto se usa para generar la documentación en la ruta `/docs`.
    createRoute({
      method: "post",
      path: "/login",
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
                email: z
                  .string()
                  .email()
                  .openapi({ example: "admin@admin.com" }),
                password: z
                  .string()
                  .min(8)
                  .max(255)
                  .openapi({ example: "12345678" }),
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
    // Definimos la función que se ejecutará cuando se haga una petición a esta ruta.
    async function (c: Context): Promise<any> {
      if (!Bun.env.JWT_SECRET) {
        throw new Error("JWT_SECRET is not set");
      }

      const body = await c.req.json();

      // Recuperamos el usuario que se quiere logear
      const user = await User.findOne({
        email: body.email,
      });

      // Si no existe devolvemos un 422
      if (!user) {
        return c.json(
          {
            error: "Invalid email or password",
          },
          422
        );
      }

      // Verificamos la contraseña introducida contra la contraseña almacenada en la BBDD
      const passwordValid = await Bun.password.verify(
        body.password,
        user.password
      );

      // Si no es válida devolvemos un 422
      if (!passwordValid) {
        return c.json(
          {
            error: "Invalid email or password",
          },
          422
        );
      }

      // Si es válida generamos un token y lo almacenamos en una Cookie
      const userPayload = buildUserPayload(user);
      const token = await sign(userPayload, Bun.env.JWT_SECRET);
      setCookie(c, "token", token);

      return c.json(
        {
          // También devolvemos estos datos en la respuesta
          user: userPayload,
          token,
        } as LoginResponse,
        200
      );
    }
  );
};

// Esta funcion construye el payload que se almacenara en el token y se devolvera en la respuesta.
// A priori lo que hace es devolver el modelo de usuario sin el campo de contraseña.
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
