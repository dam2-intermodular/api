import { z } from "@hono/zod-openapi";

export const ReviewResourceSchema = z.object({
  _id: z.object({
    $oid: z.string(),
  }),

  user_id: z.string(),
  username: z.string(),
  room_id: z.string(),
  room_name: z.string(),
  rating: z.number(),
  review: z.string(),



  createdAt: z.date(),
});

export type ReviewResource = z.infer<typeof ReviewResourceSchema>;