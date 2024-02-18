import { Context } from "hono";
import { z } from "zod";
import { Room } from "../../../models/room";
import { OpenAPIHono, createRoute } from "@hono/zod-openapi";
import { RoomResourceSchema } from "../../../resources/room";
import { createResourceFromDocument } from "../../../mongo";
import authMiddleware from "../../middlewares/auth";
import employeeMiddleware from "../../middlewares/employee";
import { UserRole } from "../../../models/user";

// Autora: Lucía Lozano López
//
// Esta ruta permite actualizar habitaciones a administradores
// y empleados, excepto el precio para empleados
export default (app: OpenAPIHono) => {
  app.use("/room/:room_number", authMiddleware);
  app.use("/room/:room_number", employeeMiddleware);
  app.openapi(
    createRoute({
      method: "put",
      path: "/room/:room_number",
      request: {
        body: {
          content: {
            "application/json": {
              schema: z.object({
                room: z.object({
                  beds: z.number().optional(),
                  price_per_night: z.number().optional(),
                  image_path: z.string().optional(),
                  description: z.string().optional(),
                  services: z.array(z.string()).optional(),
                })
              }),
            },
          },
        },
      },
      responses: {
        201: {
          description: "Room updated",
          content: {
            "application/json": {
              schema: z.object({
                room: RoomResourceSchema,
              }),
            },
          },
        },
        400: {
          description: "Bad request",
          content: {
            "application/json": {
              schema: z.object({
                message: z.string(),
              }),
            },
          },
        },
      },
    }),


    async function (c: Context): Promise<any> {
      const body = await c.req.json();
      const roomNumber = c.req.param("room_number");
      // Se recoge el número de habitación de la URL y se comprueba que no esté vacía; 
      // es decir, que se haya enviado dicho número de habitación
      if (!roomNumber) {
        return c.json(
          {
            message: "No params provided",
          },
          400
        );
      }

      // Se recoge el cuerpo de la petición y se comprueba si tiene precio
      // En caso de tenerlo, se comprueba si el usuario realizando la
      // petición es un administrador. En caso negativo, código 401
      if (body.price_per_night != null || body.price_per_night != undefined) {
        if (await c.get("user").role != UserRole.ADMIN) {
          return c.json(
            {
              message: "Unauthorized"
            },
            401
          );
        }
      }

      // Se busca y actualiza la habitación indicada en parámetros
      const room = await Room.findOneAndUpdate({
        room_number: roomNumber,
      },
        body,
        {
          new: true,
        }
      );
      // Se comprueba si ha funcionado
      if (!room)
        return c.json({
          message: "Room not found",
        },
          404
        );
      // Se devuelve la habitación nueva como su recurso
      return c.json({
        room: createResourceFromDocument(room, RoomResourceSchema),
      },
        201
      );
    }
  );
};
