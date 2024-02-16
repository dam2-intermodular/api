import { Context } from "hono";
import { z } from "zod";
import { OpenAPIHono, createRoute } from "@hono/zod-openapi";
import authMiddleware from "../../middlewares/auth";
import adminMiddleware from "../../middlewares/admin";
import { Room } from "../../../models/room";

export default (app: OpenAPIHono) => {
    app.use("/rooms/:room_number", authMiddleware);
    app.use("/rooms/:room_number", adminMiddleware);
    app.openapi(
        createRoute({
            method: "delete",
            path: "/rooms/:room_number",
            responses: {
                204: {
                    description: "Room deleted successfully",
                },
                404: {
                    description: "Room not found",
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
            try {
                const room = await Room.findByIdAndDelete({
                    _id: c.req.param("room_number"),
                });

                if (!room) {
                    return c.json(
                        {
                            message: "Room not found",
                        },
                        404
                    );
                }

                return c.json(
                    {
                        message: "Room deleted successfully",
                    },
                    200
                );
            } catch (error) {
                return c.json(
                    {
                        message: error
                    },
                    500
                );
            }
        }
    );
};

