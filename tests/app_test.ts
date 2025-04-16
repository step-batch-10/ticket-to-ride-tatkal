import { createApp } from "../src/app.ts";
import { assertEquals } from "assert";
import { describe, it } from "jsr:@std/testing/bdd";
import { serveStatic } from "hono/deno";
import { Context, Hono } from "hono";

const logger = () => async (_: Context, n: Function) => await n();

describe("App /", () => {
  it("should serve the home page for user, if user is authenticated", async () => {
    const app: Hono = createApp(logger, serveStatic);
    const r: Response = await app.request("/", {
      headers: { cookie: "User-ID=1" },
    });

    assertEquals(r.status, 200);
    await r.text();
  });
});
