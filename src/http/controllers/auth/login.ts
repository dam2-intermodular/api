import { zValidator } from "@hono/zod-validator";
import { Context } from "hono";
import { z } from "zod";
import { User } from "../../../models/user";
import { setCookie } from "hono/cookie";
import { sign } from "hono/jwt";

export default {
  validator: zValidator(
    "json",
    z.object({
      email: z.string().email(),
      password: z.string().min(8).max(255),
    })
  ),
  handler: async function (c: Context): Promise<object> {
    const body = await c.req.json();

    const user = await User.findOne({
      email: body.email,
    });

    if (!user) {
      return c.json(
        {
          error: "Invalid email or password",
        },
        401
      );
    }

    const passwordValid = await Bun.password.verify(
      body.password,
      user.password
    );

    if (!passwordValid) {
      return c.json(
        {
          error: "Invalid email or password",
        },
        401
      );
    }

    const userPayload = user.toJSON();

    const token = await sign(userPayload, "secret");
    setCookie(c, "token", token);

    return c.json(
      {
        user: userPayload,
        token,
      },
      200
    );
  },
};
