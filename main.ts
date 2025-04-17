import { Hono } from "hono";
import { createApp } from "./src/app.ts";
import { logger } from "hono/logger";
import { serveStatic } from "hono/deno";
import { Users } from "./src/models/users.ts";
import { GameHandler } from "./src/models/game-handlers.ts";

const main = (): void => {
  try {
    const app: Hono = createApp(
      logger,
      serveStatic,
      Deno.readTextFileSync,
      new Users(),
      new GameHandler(),
    );
    const port: number = 3000;

    Deno.serve({ port }, app.fetch);
  } catch (e) {
    console.error("error: Initiating Server...", e);
  }
};

main();
