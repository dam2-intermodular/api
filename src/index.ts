import declareRoutes from "./routes/api";
import mongo from "./mongo";
import { HonoBase } from "hono/hono-base";
import { OpenAPIHono } from "@hono/zod-openapi";
import { swaggerUI } from "@hono/swagger-ui";
import { stream, streamText, streamSSE } from "hono/streaming";
import path from "node:path";

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

function sanitizePath(path: string) {
  return path.replace(/(\.\.\/|\/\.\.)/g, "");
}

function declarePublicDirectory(app: HonoBase) {
  app.get("/public/*", async (c) => {
    const requestedPath = new URL(c.req.url?.replace("/public", "")).pathname;
    let localPath = path.join(process.cwd(), "public", requestedPath);
    // HMM revisar
    localPath = sanitizePath(localPath);

    const file = Bun.file(localPath);
    if (!(await file.exists())) {
      return c.json({ error: "Not found" }, 404);
    }

    const fileStream = file.stream();
    if (fileStream === null) {
      return c.json({ error: "Not found" }, 404);
    }

    return stream(c, async (stream) => {
      stream.onAbort(() => {
        console.log("Aborted!");
      });

      await stream.pipe(fileStream);
    });
  });
}

export async function createApp(): Promise<HonoBase> {
  await bootstrapMongo();

  let app = new OpenAPIHono();
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

  return app;
}

const app = await createApp();
export default {
  port: Bun.env["PORT"] ?? 8000,
  fetch: app.fetch,
};
