import { Context } from "hono";
import { z } from "zod";
import { OpenAPIHono, createRoute } from "@hono/zod-openapi";
import { createResourceFromDocument } from "../../../mongo";
import { RoomResourceSchema } from "../../../resources/room";
import { Room } from "../../../models/room";

export default (app: OpenAPIHono) => {
    app.openapi(
        createRoute({
            method: "get",
            path: "/room/:room_number",
            request: {
                query: z.object({
                    room_number: z.string().min(3).max(3),
                }),
            },
            responses: {
                200: {
                    description: "Room details",
                    content: {
                        "application/json": {
                            schema: z.object({
                                rooms: z.array(RoomResourceSchema),
                            }),
                        },
                    },
                },
                404: {
                    description: "Not found",
                    content: {
                        "application/json": {
                            schema: z.object({
                                rooms: z.array(RoomResourceSchema),
                            }),
                        },
                    },
                },
            },
        }),
        async function (c: Context): Promise<any> {
            const roomNumber = c.req.param("room_number");

            if (!roomNumber) {
                return c.json({
                    message: "No params provided"
                },
                    400
                );
            }

            const room = await Room.findOne({
                room_number: roomNumber
            });

            if (!room) {
                return c.json({
                    message: "Room not found"
                },
                    404
                );
            }

            return c.json({
                room
            },
                200
            );
        }
    );
};
