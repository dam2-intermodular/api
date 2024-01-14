import { Hono } from "hono";
import api from "./routes/api";
import mongo from "./mongo";
import { HonoBase } from "hono/hono-base";
import { Error, MongooseError } from "mongoose";

async function bootstrapMongo() {
  try {
    await mongo();
  } catch (error: any) {
    if (error.name === "MongooseServerSelectionError") {
      console.error(
        "Error connecting to mongo, check if server is up. Read the file README.md for more info on how to set up for local development"
      );
      process.exit(1);
    }
  }
}

function declareRoutes(app: HonoBase): HonoBase {
  return api(app);
}

export async function createApp(): Promise<HonoBase> {
  await bootstrapMongo();

  let app = new Hono();
  declareRoutes(app);

  return app;
}

const app = await createApp();
export default app;
