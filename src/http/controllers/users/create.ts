import { Context } from "hono";
import { z } from "zod";
import { User, UserRole } from "../../../models/user";
import { OpenAPIHono, createRoute } from "@hono/zod-openapi";
import { UserResourceSchema } from "../../../resources/user";
import { createResourceFromDocument } from "../../../mongo";
import authMiddleware from "../../middlewares/auth";
import adminMiddleware from "../../middlewares/employee";

// Autor: Víctor García Fernández
//
// Esta ruta crea un usuario 
// Hace uso de los middlewares de auth y admin
export default (app: OpenAPIHono) => {
  app.use("/users", authMiddleware);
  app.use("/users", adminMiddleware);
  app.openapi(
    createRoute({
      method: "post",
      path: "/users",
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
        409: {
          description: "Email or DNI already exist",
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
      // Se guarda el cuerpo de la petición
      // Se comprueba si el email y el DNI están usados
      if (await isEmailOrDniUsed(body.email, body.user_data?.dni)) {
        return c.json(
          {
            message: "Email or DNI already exist",
          },
          409
        );
      }
      // Se hashea la contraseña
      const hashedPassword = await Bun.password.hash(body.password);
      // Se crea el usuario y se guarda la respuesta
      const user = await User.create({
        user_data: body.user_data,
        email: body.email,
        password: hashedPassword,
      });
      // Se comprueba el resultado de la operación
      if (!user) {
        return c.json(
          {
            message: "Error creating user"
          },
          400
        );
      }
      // Se devuelve el usuario creado sin datos sensibles
      return c.json(
        {
          user: createResourceFromDocument(user, UserResourceSchema),
        },
        201
      );
    }
  );
};

// Autores: Luis Miguel Palos Alhama y Víctor García Fernández
//
// Esta función verifica si un email o un dni ya están en uso en la base de datos.
export async function isEmailOrDniUsed(
  email: string | null = null,
  dni: string | null = null
): Promise<boolean> {
  return new Promise((resolve) => {
    const or = [];
    // Si existe un email, lo guarda en el array
    if (email) {
      or.push({ email });
    }
    // Si existe un DNI, lo guarda en el array
    if (dni) {
      or.push({ "user_data.dni": dni });
    }
    // Si ya existe el email o el DNI, no será null
    // Por lo que devolverá true, "sí existe(n)"
    User.exists({ $or: or }).then((exists) => {
      resolve(exists !== null);
    });
  });
}
