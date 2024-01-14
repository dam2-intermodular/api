import { Context } from "hono";
import { z } from "zod";
import { zValidator } from "@hono/zod-validator";

export default {
  validator: zValidator(
    "json",
    z.object({
      body: z.object({
        name: z.string().min(3).max(255),
        email: z.string().email(),
        password: z.string().min(6).max(255),
      }),
    })
  ),
  handler: function (c: Context): object {
    const data = c.req.valid("json");

    return c.json(data);
  },
};
