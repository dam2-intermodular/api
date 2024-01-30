import { z } from "@hono/zod-openapi";

export const UserResourceSchema = z.object({
  _id: z.object({
    $oid: z.string(),
  }),
  email: z.string(),
  user_data: z.any(),
  role: z.string(),
  updatedAt: z.date().nullable(),
  createdAt: z.date(),
});

export type UserResource = z.infer<typeof UserResourceSchema>;
