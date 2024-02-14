import { Context } from "hono";
import { z } from "zod";
import { OpenAPIHono, createRoute } from "@hono/zod-openapi";
import { User, UserRole } from "../../../models/user";
import { UserResourceSchema } from "../../../resources/user";
import authMiddleware from "../../middlewares/auth";
import adminMiddleware from "../../middlewares/admin";

export default (app: OpenAPIHono) => {
  app.use("/users/:id", authMiddleware);
  app.use("/users/:id", adminMiddleware);
  app.openapi(
    createRoute({
      method: "delete",
      path: "/users/:id",

      responses: {
        204: {
          description: "User deleted successfully",
        },
        404: {
          description: "User not found",
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
      const user = await User.findByIdAndDelete({
        _id: c.req.param("id"),
      });

      if (!user) {
        return c.json(
          {
            message: "User not found",
          },
          404
        );
      }
      return c.json(
        {
          message: "User deleted",
        },
        200
      );
    }
  );
};

