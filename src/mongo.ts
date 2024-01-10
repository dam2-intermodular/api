import mongoose from "mongoose";

export default async function () {
  const user = Bun.env["MONGODB_USERNAME"];
  const password = Bun.env["MONGODB_PASSWORD"];
  const host = Bun.env["MONGODB_HOST"] ?? "localhost";
  const port = Bun.env["MONGODB_PORT"] ?? 27017;
  const database = Bun.env["MONGODB_DATABASE"] ?? "hotel";

  await mongoose.connect(
    `mongodb://${user}:${password}@${host}:${port}/${database}?authSource=admin`
  );
}
