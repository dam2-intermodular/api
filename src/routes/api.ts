import ping from "../http/controllers/ping";
import usersCreate from "./../http/controllers/users/create";
import authMe from "./../http/controllers/auth/me";
import authLogin from "./../http/controllers/auth/login";

export default function (app: any) {
  app.get("/ping", ping.handler);

  // Users
  app.post("/users", usersCreate.validator, usersCreate.handler);

  // Auth
  app.get("/me", authMe.middleware, authMe.handler);
  app.post("/login", authLogin.validator, authLogin.handler);

  return app;
}
