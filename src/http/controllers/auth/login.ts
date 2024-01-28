import { zValidator } from "@hono/zod-validator";
import { Context } from "hono";
import { z } from "zod";
import { User } from "../../../models/user";
import { setCookie } from "hono/cookie";
import { sign } from "hono/jwt";

type LoginResponseUser = {
  _id: string;
  email: string;
  role: string;
  createdAt: string;
  updatedAt: string;
};
type LoginResponse = {
  user: LoginResponseUser;
  token: string;
};

export default {
  validator: zValidator(
    "json",
    z.object({
      email: z.string().email(),
      password: z.string().min(8).max(255),
    })
  ),
  handler: async function (c: Context): Promise<object> {
    if (!Bun.env.JWT_SECRET) {
      throw new Error("JWT_SECRET is not set");
    }

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

    const userPayload = buildUserPayload(user);

    const token = await sign(userPayload, Bun.env.JWT_SECRET);
    setCookie(c, "token", token);

    return c.json(
      {
        user: userPayload,
        token,
      } as LoginResponse,
      200
    );
  },
};

function buildUserPayload(user: any): LoginResponseUser {
  const userJson = user.toJSON();

  const userPayload = {
    _id: userJson._id.toString(),
    email: userJson.email,
    role: userJson.role,
    createdAt: userJson.createdAt?.toISOString(),
    updatedAt: userJson.updatedAt?.toISOString(),
  } as LoginResponseUser;

  return userPayload;
}
