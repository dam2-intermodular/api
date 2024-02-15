import { Context } from "hono";
import { UserRole } from "../../models/user";

// Autor: Luis Miguel Palos
//
// Este middleware comprueba si el usuario autenticado es empleado.
export default async function adminMiddleware(c: Context, next: Function) {
    const user = await c.get("user");

    if (!user) {
        return c.json({ message: "Unauthorized" }, 401);
    }

    if (user.role !== UserRole.EMPLOYEE) {
        return c.json({ message: "Forbidden" }, 403);
    }

    return next();
}
