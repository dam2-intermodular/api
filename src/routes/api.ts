import ping from "../http/controllers/ping";
import usersCreate from "./../http/controllers/users/create";
import usersMe from "./../http/controllers/users/me";

export default function (app: any) {
  app.get("/ping", ping.handler);

  app.post("/users", usersCreate.validator, usersCreate.handler);
  app.get("/users/me", usersMe.middleware, usersMe.handler);

  return app;
}
