import { Context } from "hono";
import { z } from "zod";
import { zValidator } from "@hono/zod-validator";
import authMiddleware from "../../middlewares/auth";
import { User } from "../../../models/user";

export default {
  validator: zValidator(
    "json",
    z.object({
      name: z.string().min(3).max(255),
      email: z.string().email(),
      password: z.string().min(8).max(255),
    })
  ),
  handler: async function (c: Context): Promise<object> {
    const body = await c.req.json();
    if (!(await isEmailUnique(body.email))) {
      return c.json(
        {
          message: "El email ya existe en la base de datos",
        },
        400
      );
    }

    const hashedPassword = await Bun.password.hash(body.password);

    const user = await User.create({
      name: body.name,
      email: body.email,
      password: hashedPassword,
    });

    return c.json(
      {
        user,
      },
      201
    );
  },
};

async function isEmailUnique(email: string): Promise<boolean> {
  const result = await User.findOne({ email });
  return result === null;
}

