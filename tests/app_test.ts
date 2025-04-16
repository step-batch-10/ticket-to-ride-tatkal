import { createApp } from "../src/app.ts";
import { assertEquals } from "assert";
import { describe, it } from "jsr:@std/testing/bdd";
import { serveStatic } from "hono/deno";
import { Context, Hono } from "hono";
import { UsMap } from "../src/models/UsMap.ts";

const logger = () => async (_: Context, n: Function) => await n();

const mockedReader = (_path: string | URL): string => {
  return "usa map";
};

describe("App /", () => {
  it("should redirect the user to login if user is not authenticated", async () => {
    const app: Hono = createApp(logger, serveStatic, mockedReader);
    const r: Response = await app.request("/");

    assertEquals(r.status, 303);
    assertEquals(r.headers.get("location"), "/login.html");
    await r.text();
  });

  it("should serve the home page for user, if user is authenticated", async () => {
    const app: Hono = createApp(logger, serveStatic, mockedReader);
    const r: Response = await app.request("/", {
      headers: { cookie: "user-ID=1" },
    });

    assertEquals(r.status, 200);
    await r.text();
  });

  it("should serve the map", async () => {
    const app: Hono = createApp(logger, serveStatic, mockedReader);
    const r: Response = await app.request("/game/map");

    assertEquals(r.status, 200);
    assertEquals(await r.json(), { svg: "usa map" });
  });
});

describe("usMap", () => {
  describe("fetchMap", () => {
    it("should give map data of map file", () => {
      const usaMap = new UsMap(mockedReader);
      assertEquals(usaMap.getMap(), "usa map");
    });
  });
});
