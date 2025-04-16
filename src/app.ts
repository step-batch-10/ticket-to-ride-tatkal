import { Context, Hono, Next } from "hono";
import { GameHandler } from "./models/game-handlers.ts";
import { Reader } from "./models/schemas.ts";
import { getCookie } from "hono/cookie";
import { Logger, ServeStatic } from "./types.ts";

const setContext = (reader: Reader) => async (context: Context, next: Next) => {
  context.set("reader", reader);
  await next();
};

const authenticateUser = async (c: Context, next: Next) => {
  const userID: string | undefined = getCookie(c, "user-ID");

  if (!userID) {
    return c.redirect("/login.html", 303);
  }

  await next();
};

const createApp = (
  logger: Logger,
  serveStatic: ServeStatic,
  reader: Reader,
): Hono => {
  const app: Hono = new Hono();
  const handlers = new GameHandler();
  app.use(logger());
  app.use(setContext(reader));
  app.get("/game/map", handlers.fetchMap);
  app.get("/login.html", serveStatic({ root: "./public" }));
  app.get("/styles/login.css", serveStatic({ root: "./public" }));
  app.get("/scripts/login.js", serveStatic({ root: "./public" }));
  app.use("/*", authenticateUser);
  app.get("/*", serveStatic({ root: "./public" }));
  return app;
};

export { createApp };
