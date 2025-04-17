import { createApp } from "../src/app.ts";
import { assert, assertEquals } from "assert";
import { describe, it } from "jsr:@std/testing/bdd";
import { serveStatic } from "hono/deno";
import { Context, Hono } from "hono";
import { UsMap } from "../src/models/UsMap.ts";
import { Users } from "../src/models/users.ts";

const logger = () => async (_: Context, n: Function) => await n();

const mockedReader = (_path: string | URL): string => {
  return "usa map";
};

describe("User authentication", () => {
  it("should redirect the user to login if user is not authenticated", async () => {
    const app: Hono = createApp(logger, serveStatic, mockedReader, new Users());
    const r: Response = await app.request("/");

    assertEquals(r.status, 303);
    assertEquals(r.headers.get("location"), "/login.html");
    await r.text();
  });

  it("should serve the home page for user, if user is authenticated", async () => {
    const app: Hono = createApp(logger, serveStatic, mockedReader, new Users());
    const r: Response = await app.request("/", {
      headers: { cookie: "user-ID=1" },
    });

    assertEquals(r.status, 200);
    await r.text();
  });
});

describe("usMap", () => {
  describe("fetchMap", () => {
    it("should give map data of map file", () => {
      const usaMap = UsMap.getInstance(mockedReader);
      assertEquals(usaMap.getMap(), "usa map");
    });
  });
});

describe("App /login", () => {
  it("should set cookie with the user id, when given a username", async () => {
    const app: Hono = createApp(logger, serveStatic, mockedReader, new Users());
    const body = new FormData();
    body.append("username", "player");

    const r: Response = await app.request("/login", {
      method: "POST",
      body,
    });

    assertEquals(r.status, 303);
    assertEquals(r.headers.get("location"), "/");
    assert(r.headers.get("set-cookie")?.includes("user-ID=1"));
  });
});
