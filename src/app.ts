import { Hono } from "hono";

const createApp = (logger: Function, serveStatic: Function): Hono => {
  const app: Hono = new Hono();

  app.use(logger());
  app.get("/", serveStatic({ root: "./public" }));

  return app;
};

export { createApp };
