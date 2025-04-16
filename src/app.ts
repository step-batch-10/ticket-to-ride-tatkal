import { Context, Hono, Next } from "hono";
import { getCookie } from "hono/cookie";
import { Logger, ServeStatic } from "./types.ts";

const authenticateUser = async (c: Context, next: Next) => {
  const userID: string | undefined = getCookie(c, "user-ID");

  if (!userID) {
    return c.redirect("/login.html", 303);
  }

  await next();
};

const createApp = (logger: Logger, serveStatic: ServeStatic): Hono => {
  const app: Hono = new Hono();
  app.use(logger());

  app.get("/login.html", serveStatic({ root: "./public" }));
  app.get("/styles/login.css", serveStatic({ root: "./public" }));
  app.get("/scripts/login.js", serveStatic({ root: "./public" }));

  app.use("/*", authenticateUser);
  app.get("/*", serveStatic({ root: "./public" }));

  return app;
};

export { createApp };
