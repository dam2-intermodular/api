import { Context } from "hono";
import { getCookie, deleteCookie } from "hono/cookie";
import { verify } from "hono/jwt";

// Autor: Víctor García Fernández
//
// Este middleware comprueba si el usuario está autenticado.
export default async function authMiddleware(c: Context, next: Function) {
  // Comprueba si el JWT Secret está establecido
  if (!Bun.env.JWT_SECRET) {
    throw new Error("JWT_SECRET is not set");
  }
  // Recoge la cookie del token creado al iniciar sesión
  // Comprueba su existencia
  let token = getCookie(c, "token");
  if (!token) {
    // Si el token no existe, se recoge del encabezado
    token = getTokenFromHeader(c);
  }
  // Construye una carga, verificando el token con el secreto
  if (token) {
    const payload = await verify(token, Bun.env.JWT_SECRET);
    // Si el proceso es exitoso, se guarda en una cookie
    if (payload) {
      c.set("user", payload);
      return await next();
    }
    // Si no, se elimina la cookie en caso de existir
    deleteCookie(c, "token");
  }
  // Se devuelve un 401, no autorizado
  return c.json(
    {
      message: "Unauthorized",
    },
    401
  );
}
// Esta función recoge el token del encabezado de una petición
function getTokenFromHeader(c: Context) {
  return c.req.header("Authorization")?.split(" ")[1];
}
