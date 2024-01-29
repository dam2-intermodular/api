import ping from "../http/controllers/ping";
import usersCreate from "./../http/controllers/users/create";
import authMe from "./../http/controllers/auth/me";
import authLogin from "./../http/controllers/auth/login";

export default function (app: any) {
  ping(app);

  // Users
  usersCreate(app);

  // Auth
  authMe(app);
  authLogin(app);

  return app;
}
