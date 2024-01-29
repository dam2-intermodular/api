import { z } from "@hono/zod-openapi";

export interface UserResource {
  _id: String;
  email: String;
  role: String;
  user_data: {
    name: String;
    surname: String;
    dni: String;
    birthDate: String;
  };
  updatedAt?: String;
  createdAt: String;
}

export const userSchema = z.object({
  _id: z.object({
    $oid: z.string(),
  }),
  email: z.string(),
  role: z.string(),
  user_data: z.object({
    name: z.string(),
    surname: z.string(),
    dni: z.string(),
    birthDate: z.date(),
  }),
  updatedAt: z.date().nullable(),
  createdAt: z.date(),
});
