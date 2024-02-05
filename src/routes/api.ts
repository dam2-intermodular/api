import ping from "../http/controllers/ping";
import usersCreate from "./../http/controllers/users/create";
import usersList from "./../http/controllers/users/list";
import userUpdate from "./../http/controllers/users/update";
import userDelete from "./../http/controllers/users/delete";
import authMe from "./../http/controllers/auth/me";
import authLogin from "./../http/controllers/auth/login";
import authMiddleware from "../http/middlewares/auth";
import adminMiddleware from "../http/middlewares/admin";

export default function (app: any) {
  ping(app);

  // Users
  app.use("/users", authMiddleware);
  app.use("/users", adminMiddleware);
  usersCreate(app);
  usersList(app);
  userUpdate(app);
  userDelete(app);

  // Auth
  authMe(app);
  authLogin(app);

  return app;
}
