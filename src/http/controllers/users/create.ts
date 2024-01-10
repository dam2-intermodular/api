import { Context } from "hono";
import { ClientResponse, Response } from "hono/dist/types/client/types";

export default function (c: Context): object {
  console.log(typeof c.json({}));

  return c.json({
    message: "User created",
    body: c.body,
  });
}
