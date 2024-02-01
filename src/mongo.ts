import mongoose from "mongoose";
import { z } from "@hono/zod-openapi";

export default async function () {
  const user = Bun.env["MONGODB_USERNAME"];
  const password = Bun.env["MONGODB_PASSWORD"];
  const protocol = Bun.env["MONGODB_PROTO"] || "mongodb+srv";
  const host = Bun.env["MONGODB_HOST"] ?? "localhost";
  const port = Bun.env["MONGODB_PORT"];
  const database = Bun.env["MONGODB_DATABASE"] ?? "hotel";

  const portString = port !== "" ? `:${port}` : "";

  await mongoose.connect(
    `${protocol}://${user}:${password}@${host}${portString}/${database}?authSource=admin`
  );
}

export function createResourceFromDocument(
  document: mongoose.Document,
  schema: z.ZodObject<any, any, any>
): any {
  const jsonDocument = document.toJSON();

  const schemaKeys = Object.keys(schema.shape);
  const documentKeys = Object.keys(jsonDocument);

  const resource: any = {};

  documentKeys
    .filter((key) => schemaKeys.includes(key))
    .forEach((key) => {
      resource[key] = jsonDocument[key];
    });

  return resource;
}
