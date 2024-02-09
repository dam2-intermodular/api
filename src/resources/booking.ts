import { z } from "@hono/zod-openapi";
import { BookingStatus } from "../models/booking";

export const BookingResourceSchema = z.object({
  _id: z.object({
    $oid: z.string(),
  }),

  room_id: z.number(),
  user_id: z.number(),
  invoice_id: z.number(),

  check_in_date: z.date(),
  check_out_date: z.date(),

  status: z.nativeEnum(BookingStatus),

  updatedAt: z.date().nullable(),
  createdAt: z.date(),
});

export type BookingResource = z.infer<typeof BookingResourceSchema>;
