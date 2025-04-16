import { Hono } from "hono";
import { GameHandler } from "./models/game-handlers.ts";
import { Context } from "hono";
import { Next } from "hono/types";
import { Reader } from "./models/schemas.ts";
const setContext = (reader: Reader) => async (context: Context, next: Next) => {
  context.set("reader", reader);
  await next();
};

const createApp = (
  logger: Function,
  serveStatic: Function,
  reader: Reader,
): Hono => {
  const app: Hono = new Hono();
  const handlers = new GameHandler();
  app.use(logger());
  app.use(setContext(reader));
  app.get("/game/map", handlers.fetchMap);
  app.use(serveStatic({ root: "./public" }));

  return app;
};

export { createApp };
