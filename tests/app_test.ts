import { createApp } from "../src/app.ts";
import { assertEquals } from "assert";
import { describe, it } from "@std/testing/bdd";
import { serveStatic } from "hono/deno";
import { Context, Hono } from "hono";
import { USAMap } from "../src/models/USA_map.ts";
import { Users } from "../src/models/users.ts";
import { GameManager } from "../src/models/game_manager.ts";
import { assignRouteCities } from "../src/handlers/game_handler.ts";
import dtickets from "../json/tickets.json" with { type: "json" };
import cities from "../json/cities.json" with { type: "json" };
import { _ } from "https://cdn.skypack.dev/lodash";

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

export const prepareGameApp = () => {
  const gameHandler = new GameManager();
  gameHandler.createGame(
    [
      { name: "susahnth", id: "1" },
      { name: "susahnth", id: "2" },
      { name: "susahnth", id: "3" },
    ],
    mockedReader,
  );

  return prepareApp(new Users(), gameHandler);
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
      const usaMap = USAMap.getInstance(mockedReader);
      assertEquals(usaMap.getMap(), "usa map");
    });
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

    assertEquals(await r.json(), { message: "game not started" });
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

    assertEquals(await r.json(), { message: "game not started" });
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
        color: "red",
      },
      {
        id: "2",
        name: "Sarup",
        tickets: 0,
        trainCarCards: 4,
        trainCars: 45,
        color: "blue",
      },

      {
        id: "3",
        name: "hari",
        tickets: 0,
        trainCarCards: 4,
        trainCars: 45,
        color: "green",
      },
    ];

    const playersDetail = await r.json();
    assertEquals(playersDetail, expected);
  });
});

describe("GET /game/player/destination-tickets", () => {
  it("/game/player/destination-tickets should not allow non logged in user", async () => {
    const app: Hono = prepareGameApp();
    const r = await app.request("/game/player/destination-tickets");

    assertEquals(r.status, 303);
  });

  it("/game/player/destination-tickets should give tickets for the logged in user", async () => {
    const app: Hono = prepareGameApp();
    const r: Response = await app.request("/game/player/destination-tickets", {
      headers: { cookie: "user-ID=1;game-ID=1" },
    });

    const tickets = assignRouteCities(cities, dtickets.slice(0, 3));
    const expectedTickets = {
      tickets,
      minimumPickup: 2,
    };

    assertEquals(r.status, 200);
    assertEquals(await r.json(), expectedTickets);
  });
});

describe("POST /game/player/destination-tickets", () => {
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
    const res = await app.request("/game/player/destination-tickets", {
      headers: { cookie: "user-ID=1;game-ID=1" },
    });

    const body = JSON.stringify({
      selected: [{ id: "t9", from: "c5", to: "c10", points: 10 }],
      rest: [],
    });

    const response = await app.request("/game/player/destination-tickets", {
      method: "POST",
      body,
      headers: { cookie: "user-ID=1;game-ID=1" },
    });

    assertEquals(res.status, 200);
    assertEquals(response.status, 200);
  });
});

describe("POST /game/player/draw-blind-card", () => {
  it("should response with 200 when user is current player", async () => {
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

    const response = await app.request("/game/player/draw-blind-card", {
      method: "POST",
      body,
      headers: { cookie: "user-ID=1;game-ID=1" },
    });

    assertEquals(response.status, 200);
  });
});

describe("/game/player/draw-faceup-card", () => {
  it("should return drawn card when face up cards is drawn", async () => {
    const gameHandler = new GameManager();
    const gameId = gameHandler.createGame(
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
    const { game } = gameHandler.getGame(gameId)!;
    const faceUpCard = game.getFaceUpCards()[0];
    const app: Hono = prepareApp(new Users(), gameHandler);

    const r: Response = await app.request("/game/player/draw-faceup-card", {
      method: "POST",
      headers: { cookie: "user-ID=1;game-ID=1" },
      body: '{"index":0}',
    });

    assertEquals(faceUpCard, await r.json());
  });

  it("should return third drawn card when face up cards is drawn", async () => {
    const gameHandler = new GameManager();
    const gameId = gameHandler.createGame(
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
    const { game } = gameHandler.getGame(gameId)!;
    const faceUpCard = game.getFaceUpCards()[2];
    const app: Hono = prepareApp(new Users(), gameHandler);

    const r: Response = await app.request("/game/player/draw-faceup-card", {
      method: "POST",
      headers: { cookie: "user-ID=1;game-ID=1" },
      body: '{"index":2}',
    });
    assertEquals(faceUpCard, await r.json());
  });
});

describe("GET /game/player/status", () => {
  it("should return with status of the game", async () => {
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

    const response = await app.request("/game/player/status", {
      method: "GET",
      headers: { cookie: "user-ID=1;game-ID=1" },
    });

    assertEquals(response.status, 200);
  });
});

describe("POST /game/player/claim-route", () => {
  it("should return true and should claim the route", async () => {
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

    const game = gameHandler.getGame(1)?.game;
    const cards = game?.status("1").playerResources.playerHandCards;
    const card = cards?.find(({ count }) => count > 0);
    const color = card?.color;

    const app: Hono = prepareApp(new Users(), gameHandler);
    const response = await app.request("/game/player/claim-route", {
      method: "POST",
      headers: { cookie: "user-ID=1;game-ID=1" },
      body: JSON.stringify({ routeId: "r2", cardColor: color }),
    });

    assertEquals(await response.json(), { claimed: true });
  });

  it("should return false and should not claim the route as it is already claimed", async () => {
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

    const game = gameHandler.getGame(1)?.game;
    const cards = game?.status("1").playerResources.playerHandCards;
    const card = cards?.find(({ count }) => count > 0);
    const color = card?.color;
    const app: Hono = prepareApp(new Users(), gameHandler);

    await app.request("/game/player/claim-route", {
      method: "POST",
      headers: { cookie: "user-ID=1;game-ID=1" },
      body: JSON.stringify({ routeId: "r2", cardColor: color }),
    });

    const cards1 = game?.status("1").playerResources.playerHandCards;
    const card1 = cards1?.find(({ count }) => count > 0);
    const color1 = card1?.color;

    const response = await app.request("/game/player/claim-route", {
      method: "POST",
      headers: { cookie: "user-ID=2;game-ID=1" },
      body: JSON.stringify({ routeId: "r2", cardColor: color1 }),
    });

    assertEquals(await response.json(), { claimed: false });
  });

  it("should return false and should not claim the route because of difference in route and card color", async () => {
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
    const response = await app.request("/game/player/claim-route", {
      method: "POST",
      headers: { cookie: "user-ID=1;game-ID=1" },
      body: JSON.stringify({ routeId: "r28", cardColor: "red" }),
    });

    assertEquals(await response.json(), { claimed: false });
  });

  it("should return false and should not claim the route because of difference in route and card distance", async () => {
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
    const response = await app.request("/game/player/claim-route", {
      method: "POST",
      headers: { cookie: "user-ID=1;game-ID=1" },
      body: JSON.stringify({ routeId: "r28", cardColor: "white" }),
    });

    assertEquals(await response.json(), { claimed: false });
  });
});

describe("authenticatePlayerMove", () => {
  it("should  allow a player to make a  move if it is players chance", async () => {
    const app = prepareGameApp();

    const res = await app.request("/game/player/draw-blind-card", {
      method: "POST",
      headers: { cookie: "user-ID=1;game-ID=1" },
      body: JSON.stringify({}),
    });

    assertEquals(res.status, 200);
  });

  it("should not allow a player to make a move unless  it is players chance", async () => {
    const app = prepareGameApp();

    const res = await app.request("/game/player/draw-blind-card", {
      method: "POST",
      headers: { cookie: "user-ID=2;game-ID=1" },
      body: JSON.stringify({}),
    });

    assertEquals(res.status, 409);
  });
});
