import { Context } from "hono";
import { z } from "zod";
import { getSignedCookie, deleteCookie } from "hono/cookie";
import { OpenAPIHono, createRoute } from "@hono/zod-openapi";


export default (app: OpenAPIHono) => {
    app.openapi(
        createRoute({
            method: "post",
            path: "/logout",
            request: {},
            responses: {
                200: {
                    description: "Logout successful",
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
                400: {
                    description: "No se ha iniciado sesión",
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

            const cookie = getSignedCookie(c, Bun.env.JWT_SECRET);

            if (!cookie) {
                return c.json(
                    {
                        error: "No existe token de inicio de sesión\n" + z.string(),
                    },
                    400
                );
            }

            deleteCookie(c, "token");
            return c.json(
                {
                    message: "Se ha cerrado sesión correctamente"
                },
                200
            );
        }
    );
};