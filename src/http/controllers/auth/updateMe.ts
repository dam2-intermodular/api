import { Context } from "hono";
import authMiddleware from "../../middlewares/auth";
import { OpenAPIHono, createRoute, z } from "@hono/zod-openapi";
import { User } from "../../../models/user";
import { UserResourceSchema } from "../../../resources/user";
import { createResourceFromDocument } from "../../../mongo";

// Autor: Lucía Lozano
//
// Esta ruta es para obtener la información del usuario logueado.
// Se utiliza el middleware de autenticación para verificar que el usuario esté logueado.
// Se retorna la información del usuario injectada por el middleware.
export default (app: OpenAPIHono) => {
    app.use("/me/update", authMiddleware);
    app.openapi(
        createRoute({
            method: "put",
            path: "/me/update",
            request: {
                body: {
                    content: {
                        "application/json": {
                            schema: z.object({
                                password: z.string().min(8).max(255).optional(),
                                user_data: z.any().optional(),
                            }),
                        },
                    },
                },
            },
            responses: {
                200: {
                    description: "Update logged user info",
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
                            }),
                        },
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
        }),
        async function (c: Context): Promise<any> {
            const body = await c.req.json();

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

            const user = await User.findOneAndUpdate(
                {
                    _id: c.req.param(c.get("user")._id),
                },
                body,
                {
                    new: true,
                }
            );

            if (!user)
                return c.json(
                    {
                        message: "User not found",
                    },
                    404
                );

            return c.json(
                {
                    user: createResourceFromDocument(user, UserResourceSchema),
                },
                201
            );
        }
    );
};
