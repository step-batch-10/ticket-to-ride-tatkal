import { createApp } from "../src/app.ts";
import { assert, assertEquals } from "assert";
import { describe, it } from "@std/testing/bdd";
import { serveStatic } from "hono/deno";
import { Context, Hono } from "hono";
import { UsMap } from "../src/models/UsMap.ts";
import { Users } from "../src/models/users.ts";
import { GameManager } from "../src/models/game-handlers.ts";
import dtickets from "../src/models/tickets.json" with { type: "json" };

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

describe("User authentication", () => {
  it("should redirect the user to login if user is not authenticated", async () => {
    const app: Hono = prepareApp();
    const r: Response = await app.request("/");

    assertEquals(r.status, 303);
    assertEquals(r.headers.get("location"), "/login.html");
    await r.text();
  });

  it("should serve the home page for user, if user is authenticated", async () => {
    const app: Hono = prepareApp();
    const r: Response = await app.request("/", {
      headers: { cookie: "user-ID=1" },
    });

    assertEquals(r.status, 200);
    await r.text();
  });
});

describe("addToWaitingQueue", () => {
  it("should redirect to waiting page", async () => {
    const user = new Users();
    user.add({ username: "Sarup" });
    const app: Hono = prepareApp(user);
    const r: Response = await app.request("/wait", {
      method: "POST",
      headers: { cookie: "user-ID=1" },
    });
    assertEquals(r.status, 302);
  });

  it("should return empty waitingList", async () => {
    const user = new Users();
    user.add({ username: "dhanoj" });

    const app: Hono = prepareApp(user);
    const r: Response = await app.request("/waiting-list", {
      headers: { cookie: "user-ID=1" },
    });
    assertEquals(r.status, 200);
    assertEquals(await r.json(), []);
  });

  it("should response with status 200 and return waitingList", async () => {
    const gameHandler = new GameManager();
    gameHandler.createGame(
      [
        { name: "susahnth", id: "1" },
        {
          name: "susahnth",
          id: "3",
        },
        { name: "susahnth", id: "2" },
      ],
      mockedReader,
    );
    gameHandler.addToQueue({ name: "dhanoj", id: "1" }, 3);
    const user = new Users();
    user.add({ username: "dhanoj" });

    const app: Hono = prepareApp(user, gameHandler);

    const r: Response = await app.request("/waiting-list", {
      headers: { cookie: "user-ID=1" },
    });

    const actual = await r.json();

    assertEquals(r.status, 200);
    assertEquals(actual, ["dhanoj"]);
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

describe("redirectToGame", () => {
  it("should redirect to game page with game id", async () => {
    const gameHandler = new GameManager();
    gameHandler.addToQueue({ name: "dhanoj", id: "1" }, 3);
    gameHandler.addToQueue({ name: "sarup", id: "2" }, 3);
    gameHandler.addToQueue({ name: "hari", id: "3" }, 3);
    gameHandler.createGame(
      [
        { name: "dhanoj", id: "1" },
        { name: "hari", id: "3" },
        { name: "sarup", id: "2" },
      ],
      mockedReader,
    );
    const user = new Users();
    user.add({ username: "dhanoj" });

    const app: Hono = prepareApp(user, gameHandler);

    const r: Response = await app.request("/redirectToGame", {
      headers: { cookie: "user-ID=1" },
    });

    assertEquals(r.status, 302);
    assertEquals(r.headers.get("location"), "/game.html");
  });

  it("should create game and redirect to game page with game id", async () => {
    const gameHandler = new GameManager();
    gameHandler.addToQueue({ name: "dhanoj", id: "3" }, 3);
    gameHandler.addToQueue({ name: "sarup", id: "2" }, 3);
    gameHandler.addToQueue({ name: "hari", id: "4" }, 3);
    const user = new Users();
    user.add({ username: "anjali" });
    user.add({ username: "sarup" });
    user.add({ username: "dhanoj" });
    user.add({ username: "hari" });

    const app: Hono = prepareApp(user, gameHandler);

    const r: Response = await app.request("/redirectToGame", {
      headers: { cookie: "user-ID=4" },
    });

    assertEquals(r.status, 302);
    assertEquals(r.headers.get("location"), "/game.html");
  });

  it("should redirect to waiting page when player is not present in waiting list", async () => {
    const gameHandler = new GameManager();
    gameHandler.addToQueue({ name: "dhanoj", id: "4" }, 3);
    gameHandler.addToQueue({ name: "sarup", id: "2" }, 3);
    gameHandler.addToQueue({ name: "Anjali", id: "3" }, 3);

    const user = new Users();
    user.add({ username: "hari" });

    const app: Hono = prepareApp(user, gameHandler);

    const r: Response = await app.request("/redirectToGame", {
      headers: { cookie: "user-ID=1" },
    });

    assertEquals(r.status, 302);
    assertEquals(r.headers.get("location"), "/waiting-page.html");
  });

  it("should redirect to Waiting page when waiting list is not full", async () => {
    const gameHandler = new GameManager();
    gameHandler.addToQueue({ name: "dhanoj", id: "1" }, 3);
    const user = new Users();
    user.add({ username: "dhanoj" });

    const app: Hono = prepareApp(user, gameHandler);

    const r: Response = await app.request("/redirectToGame", {
      headers: { cookie: "user-ID=1" },
    });

    assertEquals(r.status, 302);
    assertEquals(r.headers.get("location"), "/waiting-page.html");
  });
});

describe("/game/map", () => {
  it("get request to /game/map", async () => {
    const gameHandler = new GameManager();
    gameHandler.createGame(
      [
        { name: "susahnth", id: "1" },
        {
          name: "susahnth",
          id: "3",
        },
        { name: "susahnth", id: "2" },
      ],
      mockedReader,
    );
    const app: Hono = prepareApp(new Users(), gameHandler);
    const r: Response = await app.request("/game/map", {
      headers: { cookie: "user-ID=1;game-ID=1" },
    });

    assertEquals(await r.json(), { svg: "usa map" });
  });
});

describe("/game/face-up-cards", () => {
  it("should respond with 5 face-up-cards json", async () => {
    const gameHandler = new GameManager();
    gameHandler.createGame(
      [
        { name: "susahnth", id: "1" },
        {
          name: "susahnth",
          id: "3",
        },
        { name: "susahnth", id: "2" },
      ],
      mockedReader,
    );
    const app: Hono = prepareApp(new Users(), gameHandler);
    const r: Response = await app.request("/game/face-up-cards", {
      headers: { cookie: "user-ID=1;game-ID=1" },
    });

    const faceUps = await r.json();
    assertEquals(faceUps.length, 5);
  });
});

describe("/game/player/hand'", () => {
  it("should respond with an array of cards", async () => {
    const gameHandler = new GameManager();
    gameHandler.createGame(
      [
        { name: "susahnth", id: "1" },
        {
          name: "susahnth",
          id: "3",
        },
        { name: "susahnth", id: "2" },
      ],
      mockedReader,
    );
    const app: Hono = prepareApp(new Users(), gameHandler);

    const r: Response = await app.request("/game/player/properties", {
      headers: { cookie: "user-ID=1;game-ID=1" },
    });

    const properties = await r.json();
    assertEquals(properties.hand.length, 9);
    assertEquals(properties.cars, 45);
  });

  it("should respond with an 404 if player not found", async () => {
    const gameHandler = new GameManager();
    gameHandler.createGame(
      [
        { name: "susahnth", id: "1" },
        {
          name: "susahnth",
          id: "3",
        },
        { name: "susahnth", id: "2" },
      ],
      mockedReader,
    );
    const app: Hono = prepareApp(new Users(), gameHandler);

    const r: Response = await app.request("/game/player/properties", {
      headers: { cookie: "user-ID=10;game-ID=1" },
    });
    assertEquals(r.status, 404);
    const message = await r.json();
    assertEquals(message, { message: "player not found" });
  });
});

describe("fetchPlayersDetails", () => {
  it("should return players detail", async () => {
    const gameHandler = new GameManager();
    gameHandler.createGame(
      [
        { name: "sushanth", id: "1" },
        {
          id: "2",
          name: "Sarup",
        },
        {
          id: "3",
          name: "hari",
        },
      ],
      mockedReader,
    );

    const app: Hono = prepareApp(new Users(), gameHandler);

    const r: Response = await app.request("/game/players-detail", {
      headers: { cookie: "user-ID=1;game-ID=1" },
    });

    const expected = [
      {
        id: "1",
        name: "sushanth",
        tickets: 0,
        trainCarCards: 4,
        trainCars: 45,
      },
      {
        id: "2",
        name: "Sarup",
        tickets: 0,
        trainCarCards: 4,
        trainCars: 45,
      },
      {
        id: "3",
        name: "hari",
        tickets: 0,
        trainCarCards: 4,
        trainCars: 45,
      },
    ];

    const playersDetail = await r.json();
    assertEquals(playersDetail, expected);
  });
});

describe("GET /game/destination-tickets", () => {
  it("/game/destination-tickets should not allow non logged in user", async () => {
    const gameHandler = new GameManager();
    gameHandler.createGame(
      [
        { name: "susahnth", id: "1" },
        {
          name: "susahnth",
          id: "3",
        },
        { name: "susahnth", id: "2" },
      ],
      mockedReader,
    );
    const app: Hono = prepareApp(new Users(), gameHandler);
    const r = await app.request("/game/destination-tickets");

    assertEquals(r.status, 303);
  });

  it("/game/destination-tickets should give tickets for the logged in user", async () => {
    const gameHandler = new GameManager();
    gameHandler.createGame(
      [
        { name: "susahnth", id: "1" },
        {
          name: "susahnth",
          id: "3",
        },
        { name: "susahnth", id: "2" },
      ],
      mockedReader,
    );
    const app: Hono = prepareApp(new Users(), gameHandler);

    const r: Response = await app.request("/game/destination-tickets", {
      headers: { cookie: "user-ID=1;game-ID=1" },
    });

    const expectedTickets = {
      tickets: dtickets.slice(-3),
      minimumPickup: 2,
    };

    assertEquals(r.status, 200);
    assertEquals(await r.json(), expectedTickets);
  });
});

describe("POST /game/destination-tickets", () => {
  it("should response with 200", async () => {
    const gameHandler = new GameManager();
    gameHandler.createGame(
      [
        { name: "susahnth", id: "1" },
        {
          name: "susahnth",
          id: "3",
        },
        { name: "susahnth", id: "2" },
      ],
      mockedReader,
    );
    const app: Hono = prepareApp(new Users(), gameHandler);

    const body = JSON.stringify({ ticketIds: [1, 2] });

    const response = await app.request("/game/destination-tickets", {
      method: "POST",
      body,
      headers: { cookie: "user-ID=1;game-ID=1" },
    });

    assertEquals(response.status, 200);
  });
});
