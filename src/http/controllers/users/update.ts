import { Context } from "hono";
import { z } from "zod";
import { User, UserRole } from "../../../models/user";
import { OpenAPIHono, createRoute } from "@hono/zod-openapi";
import { UserResourceSchema } from "../../../resources/user";
import { createResourceFromDocument } from "../../../mongo";

export default (app: OpenAPIHono) => {
    app.openapi(
        createRoute({
            method: "put",
            path: "/users/:id",
            request: {
                body: {
                    content: {
                        "application/json": {
                            schema: z.object({
                                password: z.string().min(8).max(255).optional(),
                                user_data: z.any().optional(),
                                role: z.string().optional(),
                            })
                        }
                    }
                }
            },
            responses: {
                201: {
                    description: "User updated",
                    content: {
                        "application/json": {
                            schema: z.object({
                                user: UserResourceSchema
                            })
                        }
                    }
                },
                400: {
                    description: "Bad request",
                    content: {
                        "application/json": {
                            schema: z.object({
                                message: z.string()
                            })
                        }
                    }
                }
            }
        }),
        async function (c: Context): Promise<any> {
            const body = await c.req.json();
            if (body.password === "")
                return c.json(
                    {
                        message: "Password cannot be empty",
                    },
                    400
                );

            if (body.password !== undefined)
                body.password = await Bun.password.hash(body.password);

            const user = await User.findOneAndUpdate(
                {
                    id: c.req.param()
                },
                body,
                {
                    new: true
                }
            );

            return c.json({
                user: createResourceFromDocument(user!!, UserResourceSchema),
            },
                201
            );
        }
    );
};