import { createApp } from "../src/app.ts";
import { assertEquals } from "assert";
import { describe, it } from "jsr:@std/testing/bdd";
import { serveStatic } from "hono/deno";
import { Context, Hono } from "hono";

const logger = () => async (_: Context, n: Function) => await n();

describe("App /", () => {
  it("should redirect the user to login if user is not authenticated", async () => {
    const app: Hono = createApp(logger, serveStatic);
    const r: Response = await app.request("/");

    assertEquals(r.status, 303);
    assertEquals(r.headers.get("location"), "/login.html");
    await r.text();
  });

  it("should serve the home page for user, if user is authenticated", async () => {
    const app: Hono = createApp(logger, serveStatic);
    const r: Response = await app.request("/", {
      headers: { cookie: "user-ID=1" },
    });

    assertEquals(r.status, 200);
    await r.text();
  });
});
