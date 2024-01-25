import mongoose from "mongoose";

export default async function () {
  const user = Bun.env["MONGODB_USERNAME"];
  const password = Bun.env["MONGODB_PASSWORD"];
  const protocol = Bun.env["MONGODB_PROTO"] || "mongodb+srv";
  const host = Bun.env["MONGODB_HOST"] ?? "localhost";
  const port = Bun.env["MONGODB_PORT"];
  const database = Bun.env["MONGODB_DATABASE"] ?? "hotel";

  const portString = port ? `:${port}` : "";

  await mongoose.connect(
    `${protocol}://${user}:${password}@${host}${portString}/${database}?authSource=admin`
  );
}
