import { Hono } from "hono";
import { createApp } from "./src/app.ts";
import { logger } from "hono/logger";
import { serveStatic } from "hono/deno";

const main = (): void => {
  try {
    const app: Hono = createApp(logger, serveStatic, Deno.readTextFileSync);
    const port: number = 3000;

    Deno.serve({ port }, app.fetch);
  } catch (e) {
    console.error("error: Initiating Server...", e);
  }
};

main();
