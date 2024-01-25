import ping from "../http/controllers/ping";
import usersCreate from "./../http/controllers/users/create";

export default function (app: any) {
  app.get("/ping", ping.handler);

  app.post("/users", usersCreate.validator, usersCreate.handler);

  return app;
}
