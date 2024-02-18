import { Context } from "hono";
import { z } from "zod";
import { OpenAPIHono, createRoute } from "@hono/zod-openapi";
import { BookingResourceSchema } from "../../../resources/booking";
import { createResourceFromDocument } from "../../../mongo";
import { Booking } from "../../../models/booking";
import authMiddleware from "../../middlewares/auth";
import employeeMiddleware from "../../middlewares/employee";

// Autora: Lucía Lozano López
//
// Esta ruta es para actualizar reservas
// Usa authmiddleware y employeemiddleware
export default (app: OpenAPIHono) => {
    app.use(authMiddleware);
    app.use(employeeMiddleware);
    app.openapi(
        createRoute({
            method: "put",
            path: "/booking/:id",
            request: {
                body: {
                    content: {
                        "application/json": {
                            schema: z.object({
                                room_id: z.string().optional(),
                                user_id: z.string().optional(),
                                invoice_id: z.string().optional(),
                                check_in_date: z.string().optional(),
                                check_out_date: z.string().optional(),
                                status: z.string().optional(),
                            }),
                        },
                    },
                },
            },
            responses: {
                201: {
                    description: "Book updated",
                    content: {
                        "application/json": {
                            schema: z.object({
                                book: BookingResourceSchema,
                            }),
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
            },
        }),

        async function (c: Context): Promise<any> {
            const body = await c.req.json();
            // Se busca la reserva por su ID y se actualiza
            // mandando el cuerpo de la petición
            const book = await Booking.findOneAndUpdate(
                {
                    _id: c.req.param("id"),
                },
                body,
                {
                    new: true,
                }
            );
            // Se comprueba si ha funcionado
            if (!book)
                return c.json({
                    message: "Book not found",
                },
                    404
                );
            // Se devuelve la reserva actualizada
            return c.json({
                user: createResourceFromDocument(book, BookingResourceSchema),
            },
                201
            );
        }
    )
};