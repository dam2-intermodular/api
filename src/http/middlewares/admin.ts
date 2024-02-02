import { Context } from "hono";
import { UserRole } from "../../models/user";

export default async function adminMiddleware(c: Context, next: Function) {
  const user = await c.get("user");

  if (!user) {
    return c.json({ message: "Unauthorized" }, 401);
  }

  if (user.role !== UserRole.ADMIN) {
    return c.json({ message: "Forbidden" }, 403);
  }

  return next();
}
