import { createApp } from "../src/app.ts";
import { assert, assertEquals, assertFalse } from "assert";
import { describe, it } from "@std/testing/bdd";
import { serveStatic } from "hono/deno";
import { Context, Hono } from "hono";
import { Users } from "../src/models/users.ts";
import { GameManager } from "../src/models/game_manager.ts";
import dtickets from "../json/tickets.json" with { type: "json" };

const logger = () => async (_: Context, n: Function) => await n();

const mockedReader = (_path: string | URL): string => {
  // deno-lint-ignore no-explicit-any
  const loc: any = _path;

  if (loc.endsWith(".json")) {
    return JSON.stringify(dtickets);
  }

  return "usa map";
};

const prepareApp = (users = new Users(), gameHandler = new GameManager()) => {
  const args = {
    logger,
    serveStatic,
    reader: mockedReader,
    users,
    gameHandler,
  };

  return createApp(args);
};

describe("Test for user login", () => {
  describe("when given a username", () => {
    it("should set cookie with the user id", async () => {
      const app: Hono = prepareApp();
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
});

describe("Test for user logout", () => {
  describe("when user logs out", () => {
    it("should remove user cookie & redirect to login", async () => {
      const app: Hono = prepareApp();

      const r: Response = await app.request("/logout", {
        method: "DELETE",
        headers: { "cookie": "user-ID=1" },
      });

      assertEquals(r.status, 303);
      assertEquals(r.headers.get("location"), "/login.html");
      assertFalse(r.headers.get("set-cookie")?.includes("user-ID=1"));
    });
  });
});
