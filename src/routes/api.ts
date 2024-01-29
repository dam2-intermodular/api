import ping from "../http/controllers/ping";
import usersCreate from "./../http/controllers/users/create";
import usersList from "./../http/controllers/users/list";
import authMe from "./../http/controllers/auth/me";
import authLogin from "./../http/controllers/auth/login";

export default function (app: any) {
  ping(app);

  // Users
  usersCreate(app);
  usersList(app);

  // Auth
  authMe(app);
  authLogin(app);

  return app;
}
