import { Context } from "hono";
import { z } from "zod";
import { OpenAPIHono, createRoute } from "@hono/zod-openapi";
import authMiddleware from "../../middlewares/auth";
import adminMiddleware from "../../middlewares/admin";
import { Room } from "../../../models/room";

// Autor: Luis Miguel Palos Alhama
//
// Esta ruta recibe un número de habitación para buscarla y eliminarla
export default (app: OpenAPIHono) => {
  app.use("/rooms/:room_number", authMiddleware);
  app.use("/rooms/:room_number", adminMiddleware);
  app.openapi(
    createRoute({
      method: "delete",
      path: "/rooms/:room_number",
      security: [
        {
          Bearer: [],
        },
      ],
      responses: {
        204: {
          description: "Room deleted successfully",
        },
        404: {
          description: "Room not found",
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
      try {
        const roomNumber = c.req.param("room_number");

        // Se recoge el nº de habitación de la URL y se comprueba que exista en los parámetros de la URL
        if (!roomNumber) {
          return c.json({
            message: "No params provided"
          },
            400
          );
        }

        // Se busca la habitación usando su Schema, y, si se encuentra, se elimina y devuelve 
        // la habitación eliminada
        const room = await Room.findOneAndDelete({
          room_number: roomNumber,
        });

        // Se comprueba que se haya encontrado
        if (!room) {
          return c.json(
            {
              message: "Room not found",
            },
            404
          );
        }

        // Se devuelve un código y mensaje de éxito
        return c.json(
          {
            message: "Room deleted successfully",
          },
          200
        );
      } catch (error) {
        return c.json(
          {
            message: error,
          },
          500
        );
      }
    }
  );
};
