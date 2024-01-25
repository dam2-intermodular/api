import { Context } from "hono";
import { z } from "zod";
import { zValidator } from "@hono/zod-validator";
import authMiddleware from "../../middlewares/auth";

export default {
  validator: zValidator(
    "json",
    z.object({
      name: z.string().min(3).max(255),
      email: z.string().email(),
      password: z.string().min(8).max(255),
    })
  ),
  handler: function (c: Context): object {
    return c.json(
      {
        message: "User created!",
      },
      201
    );
  },
};
