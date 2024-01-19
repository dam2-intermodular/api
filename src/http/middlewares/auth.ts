import { Context } from "hono";
import { getCookie, setCookie, deleteCookie } from "hono/cookie";
import { verify } from "hono/jwt";

export default async function authMiddleware(c: Context, next: Function) {
  if (!Bun.env.JWT_SECRET) {
    throw new Error("JWT_SECRET is not set");
  }

  const token = getCookie(c, "token");

  if (token) {
    const payload = await verify(token, Bun.env.JWT_SECRET);

    if (payload) {
      c.set("user", payload);
      return await next();
    }
  }

  return c.json(
    {
      message: "Unauthorized",
    },
    401
  );
}
