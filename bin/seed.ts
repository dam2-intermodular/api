import { Booking, BookingStatus } from "../src/models/booking";
import { Invoice, InvoiceStatus } from "../src/models/invoice";
import { Room } from "../src/models/room";
import { User, UserRole } from "../src/models/user";
import mongo from "../src/mongo";
import { faker } from "@faker-js/faker";

await mongo();

const USER_COUNT = 100;
const ROOM_COUNT = 50;
const INVOICE_COUNT = 75;
const BOOKING_COUNT = 90;

async function createUsers() {
  const usersInMongo = await User.countDocuments().exec();

  if (usersInMongo > USER_COUNT) {
    console.log("Users already created");
    return;
  }

  for (const index of Array(USER_COUNT).keys()) {
    const isAdmin = Math.random() > 0.5;

    const payload = {
      username: faker.internet.userName(),
      email: faker.internet.email(),
      password: faker.internet.password(),
      role: isAdmin ? UserRole.ADMIN : UserRole.CLIENT,
    };

    if (!isAdmin) {
      (payload as any).client_data = {
        dni: faker.string.alphanumeric(8),
        name: faker.person.firstName(),
        surname: faker.person.lastName(),
        birthdate: faker.date.past(),
      };
    }

    const user = await User.create(payload);
    console.log(`User ${index + 1}/${USER_COUNT} created`);
  }
}

createUsers();

async function createRooms() {
  const roomsInMongo = await Room.countDocuments().exec();

  if (roomsInMongo > ROOM_COUNT) {
    console.log("Rooms already created");
    return;
  }

  for (const index of Array(ROOM_COUNT).keys()) {
    const allServices = [
      "air_conditioning",
      "heating",
      "kitchen",
      "tv",
      "wifi",
      "parking",
      "elevator",
      "pool",
      "gym",
      "terrace",
      "garden",
      "pets",
      "smoking",
    ];

    const payload = {
      room_number: index + 1,
      description: faker.lorem.paragraph(),
      beds: Math.floor(Math.random() * 4) + 1,
      price_per_night: Math.floor(Math.random() * 100) + 50,
      image_path: faker.image.url(),
      services: allServices
        .sort(() => 0.5 - Math.random())
        .slice(0, Math.floor(Math.random() * allServices.length)),
    };

    await Room.create(payload);
    console.log(`Room ${index + 1}/${ROOM_COUNT} created`);
  }
}

await createRooms();

async function createInvoices() {
  const users = await User.find({
    role: UserRole.CLIENT,
  }).exec();
  const rooms = await Room.find().exec();

  for (const index of Array(INVOICE_COUNT).keys()) {
    const payload = {
      reference: faker.string.alphanumeric(8),

      user_id: users[Math.floor(Math.random() * users.length)]._id,
      room_id: rooms[Math.floor(Math.random() * rooms.length)]._id,

      status: Math.random() > 0.5 ? InvoiceStatus.PENDING : InvoiceStatus.PAID,

      billing_address: {
        name: faker.person.firstName(),
        address: faker.location.street(),
        city: faker.location.city(),
        postal_code: faker.location.zipCode(),
        country: faker.location.country(),
      },

      subtotal: Math.floor(Math.random() * 100) + 50,
      taxes: Math.floor(Math.random() * 10) + 5,
      total: Math.floor(Math.random() * 100) + 50,
    };

    await Invoice.create(payload);
    console.log(`Invoice ${index + 1}/${INVOICE_COUNT} created`);
  }
}

createInvoices();

async function createBookings() {
  const users = await User.find({
    role: UserRole.CLIENT,
  }).exec();
  const rooms = await Room.find().exec();
  const invoices = await Invoice.find().exec();

  for (const index of Array(BOOKING_COUNT).keys()) {
    const isCompleted = Math.random() > 0.5;
    const check_in = faker.date.past();

    const payload = {
      user_id: users[Math.floor(Math.random() * users.length)]._id,
      room_id: rooms[Math.floor(Math.random() * rooms.length)]._id,

      check_in_date: check_in,
      check_out_date: isCompleted
        ? faker.date.past({
            refDate: check_in,
          })
        : faker.date.future(),

      status: isCompleted
        ? BookingStatus.COMPLETED
        : Math.random() > 0.5
        ? BookingStatus.CONFIRMED
        : BookingStatus.PENDING,
    };

    if (isCompleted) {
      (payload as any).invoice_id =
        invoices[Math.floor(Math.random() * invoices.length)]._id;
    }

    await Booking.create(payload);
    console.log(`Booking ${index + 1}/${BOOKING_COUNT} created`);
  }
}

createBookings();
