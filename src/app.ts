import { Context, Hono, Next } from "hono";
import { GameHandler } from "./models/game-handlers.ts";
import { Reader } from "./models/schemas.ts";
import { getCookie, setCookie } from "hono/cookie";
import { Logger, ServeStatic } from "./types.ts";
import { Users } from "./models/users.ts";

const setContext =
  (reader: Reader, users: Users) => async (context: Context, next: Next) => {
    context.set("reader", reader);
    context.set("users", users);
    await next();
  };

const authenticateUser = async (c: Context, next: Next) => {
  const userID: string | undefined = getCookie(c, "user-ID");

  if (!userID) {
    return c.redirect("/login.html", 303);
  }

  await next();
};

const handleLogin = async (c: Context) => {
  const user = await c.req.formData();
  const users = c.get("users");
  const userID = users.add(user);

  setCookie(c, "user-ID", userID);
  return c.redirect("/", 303);
};

const createApp = (
  logger: Logger,
  serveStatic: ServeStatic,
  reader: Reader,
  users: Users,
): Hono => {
  const app: Hono = new Hono();
  const handlers = new GameHandler();
  app.use(logger());
  app.use(setContext(reader, users));

  app.get("/game/map", handlers.fetchMap);
  app.get("/login.html", serveStatic({ root: "./public" }));
  app.get("/styles/login.css", serveStatic({ root: "./public" }));
  app.get("/scripts/login.js", serveStatic({ root: "./public" }));
  app.post("/login", handleLogin);

  app.use("/*", authenticateUser);
  app.get("/*", serveStatic({ root: "./public" }));
  return app;
};

export { createApp };
