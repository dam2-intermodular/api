import { Context } from "hono";
import { z } from "zod";
import { OpenAPIHono, createRoute } from "@hono/zod-openapi";
import { Booking } from "../../../models/booking";
import adminMiddleware from "../../middlewares/admin";

export default (app: OpenAPIHono) => {
    // Ruta para obtener todas las reservas de un cliente
    app.use("/bookings/:userId", adminMiddleware);
    app.openapi(
        createRoute({
            method: "get",
            path: "/bookings/:userId",
            responses: {
                200: {
                    description: "Bookings for a user",
                    content: {
                        "application/json": {
                            schema: z.array(
                                z.object({
                                    _id: z.string(),
                                    room_id: z.string(),
                                    user_id: z.string(),
                                    invoice_id: z.string(),
                                    check_in_date: z.string(),
                                    check_out_date: z.string(),
                                    status: z.string(),
                                    createdAt: z.string(),
                                    updatedAt: z.string(),
                                })
                            ),
                        },
                    },
                },
                404: {
                    description: "User not found",
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
            const userId = c.req.param("userId");

            if (!userId) {
                return c.json({
                    message: "No user ID provided"
                },
                    400
                );
            }

            const bookings = await Booking.find({
                user_id: userId
            });

            if (!bookings || bookings.length === 0) {
                return c.json({
                    message: "No bookings found for the user"
                },
                    404
                );
            }

            return c.json({
                bookings
            },
                200
            );
        }
    );
};