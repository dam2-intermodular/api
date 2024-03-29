import declareRoutes from "./routes/api";
import mongo from "./mongo";
import { HonoBase } from "hono/hono-base";
import { logger } from "hono/logger";
import { OpenAPIHono } from "@hono/zod-openapi";
import { swaggerUI } from "@hono/swagger-ui";
import { declarePublicDirectory } from "./public";

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

export async function createApp(): Promise<HonoBase> {
  await bootstrapMongo();

  let app = new OpenAPIHono();

  app.use(logger());

  declareRoutes(app);
  declarePublicDirectory(app);

  app.get(
    "/docs",
    swaggerUI({
      url: "/doc",
    })
  );

  app.doc("/doc", {
    info: {
      title: "An API",
      version: "v1",
    },
    openapi: "3.1.0",
  });

  app.openAPIRegistry.registerComponent("securitySchemes", "Bearer", {
    type: "http",
    scheme: "bearer",
  });

  return app;
}

const app = await createApp();
export default {
  port: Bun.env["PORT"] ?? 8000,
  fetch: app.fetch,
};
