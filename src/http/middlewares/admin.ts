import { Context } from "hono";
import { UserRole } from "../../models/user";

// Autor: Víctor García Fernández
//
// Este middleware comprueba si el usuario autenticado es administrador.
export default async function adminMiddleware(c: Context, next: Function) {
  // Se recoge el usuario de la cookie creada al autentificar al usuario
  const user = await c.get("user");
  // Se comprueba la existencia de dicho usuario
  if (!user) {
    return c.json({ message: "Unauthorized" }, 401);
  }
  // Se comprueba si su rol es diferente a administrador
  if (user.role !== UserRole.ADMIN) {
    return c.json({ message: "Forbidden" }, 403);
  }
  // Se procede al siguiente middleware o función
  return next();
}
