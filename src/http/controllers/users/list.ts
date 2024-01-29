import { Context } from "hono";
import { z } from "zod";
import { User } from "../../../models/user";
import { OpenAPIHono, createRoute } from "@hono/zod-openapi";
import { userSchema } from "../../../resources/user";

export default (app: OpenAPIHono) => {
  app.openapi(
    createRoute({
      method: "get",
      path: "/users",
      request: {
        query: z.object({
          per_page: z.string().optional(),
          page: z.string().optional(),
        }),
      },
      responses: {
        200: {
          description: "List users",
          content: {
            "application/json": {
              schema: z.object({
                users: z.array(userSchema),
              }),
            },
          },
        },
      },
    }),
    async function (c: Context): Promise<any> {
      const { per_page, page } = c.req.query();
      const perPageParsed = parseInt(per_page) || 10;
      const pageParsed = parseInt(page) || 1;

      const skip = (pageParsed - 1) * perPageParsed;

      const users = await User.find().skip(skip).limit(perPageParsed).exec();

      return c.json({
        users,
      });
    }
  );
};
