import { Context } from "hono";
import { getCookie, deleteCookie } from "hono/cookie";
import { verify } from "hono/jwt";

export default async function authMiddleware(c: Context, next: Function) {
  if (!Bun.env.JWT_SECRET) {
    throw new Error("JWT_SECRET is not set");
  }

  let token = getCookie(c, "token");
  if (!token) {
    token = getTokenFromHeader(c);
  }

  if (token) {
    const payload = await verify(token, Bun.env.JWT_SECRET);

    if (payload) {
      c.set("user", payload);
      return await next();
    }

    deleteCookie(c, "token");
  }

  return c.json(
    {
      message: "Unauthorized",
    },
    401
  );
}

function getTokenFromHeader(c: Context) {
  return c.req.header("Authorization")?.split(" ")[1];
}
