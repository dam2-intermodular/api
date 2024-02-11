import { Context } from "hono";
import { z } from "zod";
import { OpenAPIHono, createRoute } from "@hono/zod-openapi";
import { Booking } from "../../../models/booking";

export default (app: OpenAPIHono) => {
    app.openapi(
        createRoute({
            method: "get",
            path: "/booking/:id",
            responses: {
                200: {
                    description: "Booking details",
                    content: {
                        "application/json": {
                            schema: z.object({
                                _id: z.string(),
                                room_id: z.string(),
                                user_id: z.string(),
                                invoice_id: z.string(),
                                check_in_date: z.string(),
                                check_out_date: z.string(),
                                status: z.string(),
                                createdAt: z.string(),
                                updatedAt: z.string(),
                            }),
                        },
                    },
                },
                404: {
                    description: "Not found",
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
            const bookingId = c.req.param("id");

            if (!bookingId) {
                return c.json({
                    message: "No params provided"
                },
                    400
                );
            }

            const booking = await Booking.findOne({
                _id: bookingId
            });

            if (!booking) {
                return c.json({
                    message: "Booking not found"
                },
                    404
                );
            }

            return c.json({
                booking
            },
                200
            );
        }
    );
};
