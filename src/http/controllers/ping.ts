import { Context } from "hono";

export default {
  handler: function (c: Context): object {
    return c.json({
      message: "pong",
    });
  },
};
