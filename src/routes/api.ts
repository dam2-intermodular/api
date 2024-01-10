import { Context } from "hono";
import usersCreate from "./../http/controllers/users/create";

export default function (app: any) {
  app.post("/users", usersCreate);
  // app.get("/users", usersList);

  return app;
}
