import { Context } from "hono";
import authMiddleware from "../../middlewares/auth";

export default {
  middleware: authMiddleware,
  handler: function (c: Context): object {
    return c.json(
      {
        user: c.get("user"),
      },
      200
    );
  },
};
