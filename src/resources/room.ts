import { z } from "@hono/zod-openapi";

export const RoomResourceSchema = z.object({
  _id: z.object({
    $oid: z.string(),
  }),
  room_number: z.string(),
  beds: z.number(),
  price_per_night: z.number(),
  image_path: z.string(),
  description: z.string(),
  services: z.array(z.string()),
  updatedAt: z.date().nullable(),
  createdAt: z.date(),
});

export type RoomResource = z.infer<typeof RoomResourceSchema>;
