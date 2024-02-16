import ping from "../http/controllers/ping";
import usersCreate from "./../http/controllers/users/create";
import usersList from "./../http/controllers/users/list";
import usersUpdate from "./../http/controllers/users/update";
import usersDelete from "./../http/controllers/users/delete";
import roomsList from "./../http/controllers/rooms/list";
import roomsBook from "./../http/controllers/rooms/book";
import roomsOne from "./../http/controllers/rooms/one";
import roomsDelete from "./../http/controllers/rooms/delete";
import userBookingsList from "./../http/controllers/users/bookings";
import reviewsList from "./../http/controllers/reviews/list";
import reviewsCreate from "./../http/controllers/reviews/create";
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
  usersUpdate(app);
  usersDelete(app);
  userBookingsList(app);

  // Auth
  authMe(app);
  authLogin(app);
  authLogout(app);
  authRegister(app);

  // Rooms
  roomsList(app);
  roomsOne(app);
  roomsBook(app);
  roomsDelete(app);

  // Reviews
  reviewsList(app);
  reviewsCreate(app);

  return app;
}
