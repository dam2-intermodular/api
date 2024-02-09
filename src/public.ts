import { HonoBase } from "hono/hono-base";
import { stream } from "hono/streaming";
import path from "node:path";

function sanitizePath(path: string) {
  return path.replace(/(\.\.\/|\/\.\.)/g, "");
}

export function declarePublicDirectory(app: HonoBase) {
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
