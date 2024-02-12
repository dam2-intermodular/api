import ping from "../http/controllers/ping";
import usersCreate from "./../http/controllers/users/create";
import usersList from "./../http/controllers/users/list";
import userUpdate from "./../http/controllers/users/update";
import userDelete from "./../http/controllers/users/delete";
import roomsList from "./../http/controllers/rooms/list";
import roomsBook from "./../http/controllers/rooms/book";
import userBookingsList from "./../http/controllers/users/bookings";
import authMe from "./../http/controllers/auth/me";
import authLogin from "./../http/controllers/auth/login";
import authLogout from "./../http/controllers/auth/logout";
import authRegister from "./../http/controllers/auth/register";

export default function (app: any) {
  ping(app);

  // Users
  userBookingsList(app);
  usersCreate(app);
  usersList(app);
  userUpdate(app);
  userDelete(app);

  // Auth
  authMe(app);
  authLogin(app);
  authLogout(app);
  authRegister(app);

  // Rooms
  roomsList(app);
  roomsBook(app);

  return app;
}
