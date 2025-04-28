import { createApp } from "../src/app.ts";
import { assert, assertEquals } from "assert";
import { describe, it } from "@std/testing/bdd";
import { serveStatic } from "hono/deno";
import { Context, Hono } from "hono";
import { Users } from "../src/models/users.ts";
import { GameManager } from "../src/models/game_manager.ts";
import dtickets from "../json/tickets.json" with { type: "json" };
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

describe("Test for User authentication", () => {
  describe("when user is not authenticated", () => {
    it("should redirect to login page", async () => {
      const app: Hono = prepareApp();
      const r: Response = await app.request("/");

      assertEquals(r.status, 303);
      assertEquals(r.headers.get("location"), "/login.html");
      await r.text();
    });
  });

  describe("when user is authenticated", () => {
    it("should redirect to login page", async () => {
      const app: Hono = prepareApp();
      const r: Response = await app.request("/", {
        headers: { cookie: "user-ID=1" },
      });

      assertEquals(r.status, 200);
      await r.text();
    });
  });
});

describe("Test for waiting page", () => {
  it("should redirect to waiting page", async () => {
    const user = new Users();
    user.add({ username: "Sarup" });
    const app: Hono = prepareApp(user);
    const r: Response = await app.request("/wait", {
      method: "POST",
      headers: { cookie: "user-ID=1" },
    });

    assertEquals(r.status, 302);
    assertEquals(r.headers.get("location"), "/waiting_page.html");
  });
});

describe("Test for waiting list", () => {
  describe("when no player is added to queue", () => {
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
  });

  describe("when fewer than max players are added to queue", () => {
    it("should return those many players in waitingList", async () => {
      const gameHandler = new GameManager();
      const players = [
        { name: "sushanth", id: "1" },
        { name: "sarup", id: "2" },
      ];
      gameHandler.createGame(players, mockedReader);
      gameHandler.addToQueue(players[0], 3);
      gameHandler.addToQueue(players[1], 3);

      const users = new Users();
      users.add({ username: "sushanth" });
      users.add({ username: "sarup" });

      const app: Hono = prepareApp(users, gameHandler);
      const r: Response = await app.request("/waiting-list", {
        headers: { cookie: "user-ID=1" },
      });

      const actual = await r.json();

      assertEquals(r.status, 200);
      assertEquals(actual, ["sushanth", "sarup"]);
    });
  });

  describe("when only max players are added to queue", () => {
    it("should return the max players in waitingList", async () => {
      const players = [
        { name: "sushanth", id: "1" },
        { name: "sarup", id: "2" },
      ];

      const gameHandler = new GameManager();
      gameHandler.createGame(players, mockedReader);

      const users = new Users();
      const app: Hono = prepareApp(users, gameHandler);

      gameHandler.addToQueue(players[0], 2);
      gameHandler.addToQueue(players[1], 2);

      users.add({ username: "sushanth" });
      users.add({ username: "sarup" });

      const r: Response = await app.request("/waiting-list", {
        headers: { cookie: "user-ID=1" },
      });

      assertEquals(r.status, 200);
      assertEquals(await r.json(), ["sushanth", "sarup"]);
    });
  });

  describe("when more than max players are added to queue", () => {
    it("should return only extra players in waitingList", async () => {
      const players = [
        { name: "sushanth", id: "1" },
        { name: "sarup", id: "2" },
        { name: "hari", id: "3" },
      ];

      const gameHandler = new GameManager();
      gameHandler.createGame(players, mockedReader);

      const users = new Users();
      const app: Hono = prepareApp(users, gameHandler);

      gameHandler.addToQueue(players[0], 2);
      gameHandler.addToQueue(players[1], 2);
      gameHandler.addToQueue(players[2], 2);

      users.add({ username: "sushanth" });
      users.add({ username: "sarup" });
      users.add({ username: "hari" });

      const r: Response = await app.request("/waiting-list", {
        headers: { cookie: "user-ID=3" },
      });

      const newQueue = await r.json();

      assertEquals(r.status, 200);
      assertEquals(newQueue, ["hari"]);
    });
  });
});

describe("Test for redirection when player arrived", () => {
  describe("when max players have arrived but game is not created", () => {
    it("should create a game and redirect to game page with game id", async () => {
      const gameHandler = new GameManager();
      const user = new Users();

      gameHandler.addToQueue({ name: "dhanoj", id: "1" }, 2);
      gameHandler.addToQueue({ name: "sarup", id: "2" }, 2);

      user.add({ username: "dhanoj" });
      user.add({ username: "sarup" });

      const app: Hono = prepareApp(user, gameHandler);

      const r: Response = await app.request("/redirectToGame", {
        headers: { cookie: "user-ID=1" },
      });

      assertEquals(r.status, 302);
      assertEquals(r.headers.get("location"), "/game.html");
      assert(r.headers.get("set-cookie")?.includes("game-ID=1"));
    });
  });

  describe("when max players have arrived and game is created", () => {
    it("should redirect to game page with game id", async () => {
      const players = [
        { name: "dhanoj", id: "1" },
        { name: "sarup", id: "2" },
      ];
      const gameHandler = new GameManager();
      const user = new Users();

      gameHandler.addToQueue({ name: "dhanoj", id: "1" }, 2);
      gameHandler.addToQueue({ name: "sarup", id: "2" }, 2);
      gameHandler.createGame(players, mockedReader);

      user.add({ username: "dhanoj" });
      user.add({ username: "sarup" });

      const app: Hono = prepareApp(user, gameHandler);

      const r: Response = await app.request("/redirectToGame", {
        headers: { cookie: "user-ID=1" },
      });

      assertEquals(r.status, 302);
      assertEquals(r.headers.get("location"), "/game.html");
      assert(r.headers.get("set-cookie")?.includes("game-ID=1"));
    });
  });

  describe(" when player is not present in waiting list", () => {
    it("should return a json message that game has not started", async () => {
      const gameHandler = new GameManager();
      const user = new Users();

      user.add({ username: "hari" });

      const app: Hono = prepareApp(user, gameHandler);
      const r: Response = await app.request("/redirectToGame", {
        headers: { cookie: "user-ID=1" },
      });

      assertEquals(await r.json(), { message: "game not started" });
    });
  });
});

describe("Test for game map", () => {
  it("should return the game map", async () => {
    const players = [
      { name: "sushanth", id: "1" },
      { name: "sarup", id: "2" },
      { name: "sam", id: "3" },
    ];
    const gameHandler = new GameManager();
    gameHandler.createGame(players, mockedReader);

    const app: Hono = prepareApp(new Users(), gameHandler);
    const r: Response = await app.request("/game/map", {
      headers: { cookie: "user-ID=1;game-ID=1" },
    });

    assertEquals(await r.json(), { svg: "usa map" });
  });
});

describe("Test for game face-up-cards", () => {
  it("should respond with 5 face-up-cards in a json", async () => {
    const players = [
      { name: "sushanth", id: "1" },
      { name: "sarup", id: "2" },
      { name: "sam", id: "3" },
    ];
    const gameHandler = new GameManager();
    gameHandler.createGame(players, mockedReader);

    const app: Hono = prepareApp(new Users(), gameHandler);
    const r: Response = await app.request("/game/face-up-cards", {
      headers: { cookie: "user-ID=1;game-ID=1" },
    });

    const faceUps = await r.json();
    assertEquals(faceUps.length, 5);
  });
});

describe("Test for cards in player's hand", () => {
  describe("when player is in game", () => {
    it("should respond with an array of cards", async () => {
      const players = [
        { name: "sushanth", id: "1" },
        { name: "sarup", id: "2" },
        { name: "sam", id: "3" },
      ];

      const gameHandler = new GameManager();
      gameHandler.createGame(players, mockedReader);

      const app: Hono = prepareApp(new Users(), gameHandler);

      const r: Response = await app.request("/game/player/properties", {
        headers: { cookie: "user-ID=1;game-ID=1" },
      });

      const properties = await r.json();

      assertEquals(properties.hand.length, 9);
      assertEquals(properties.cars, 45);
    });
  });

  describe("when player is not in game", () => {
    it("should respond with an 404", async () => {
      const players = [
        { name: "sushanth", id: "1" },
        { name: "sarup", id: "2" },
        { name: "sam", id: "3" },
      ];

      const gameHandler = new GameManager();
      gameHandler.createGame(players, mockedReader);

      const app: Hono = prepareApp(new Users(), gameHandler);
      const r: Response = await app.request("/game/player/properties", {
        headers: { cookie: "user-ID=10;game-ID=1" },
      });

      assertEquals(r.status, 404);
      const message = await r.json();
      assertEquals(message, { message: "player not found" });
    });
  });
});

describe("Test for fetching players details", () => {
  it("should return players detail", async () => {
    const players = [
      { name: "sushanth", id: "1" },
      { name: "sarup", id: "2" },
      { name: "sam", id: "3" },
    ];

    const gameHandler = new GameManager();
    gameHandler.createGame(players, mockedReader);

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
        name: "sarup",
        tickets: 0,
        trainCarCards: 4,
        trainCars: 45,
        color: "blue",
      },

      {
        id: "3",
        name: "sam",
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

describe("Test for game destination-tickets", () => {
  describe("when user is not logged in", () => {
    it("should respond with 303", async () => {
      const app: Hono = prepareGameApp();
      const r = await app.request("/game/destination-tickets");

      assertEquals(r.status, 303);
    });
  });

  describe("when user is logged in and game state is setup", () => {
    it("should respond with 200", async () => {
      const players = [
        { name: "sushanth", id: "1" },
        { name: "sarup", id: "2" },
        { name: "sam", id: "3" },
      ];
      const gameHandler = new GameManager();
      gameHandler.createGame(players, mockedReader);

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
          id: "2",
        },
        { name: "susahnth", id: "3" },
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

describe('GET "/game/setup/destination-tickets"', () => {
  it("should allow all players to fetch tickets from the game", async () => {
    const app = prepareGameApp();
    const pl1Get = await app.request("/game/setup/destination-tickets", {
      headers: { cookie: "user-ID=1;game-ID=1" },
    });
    const pl2Get = await app.request("/game/setup/destination-tickets", {
      headers: { cookie: "user-ID=2;game-ID=1" },
    });

    const { minimumPickup: pl1Min } = await pl1Get.json();
    const { minimumPickup: pl2Min } = await pl2Get.json();

    assertEquals(pl1Get.status, 200);
    assertEquals(pl1Min, 2);

    assertEquals(pl2Get.status, 200);
    assertEquals(pl2Min, 2);
  });
});

describe('GET "/game/setup/destination-tickets"', () => {
  it("should allow all players to select tickets from the game", async () => {
    const app = prepareGameApp();
    const body = JSON.stringify({
      selected: [{ id: "t9", from: "c5", to: "c10", points: 10 }],
      rest: [],
    });

    const pl2Get = await app.request("/game/setup/destination-tickets", {
      headers: { cookie: "user-ID=2;game-ID=1" },
      method: "POST",
      body,
    });

    const pl1Get = await app.request("/game/setup/destination-tickets", {
      headers: { cookie: "user-ID=1;game-ID=1" },
      method: "POST",
      body,
    });

    assertEquals(pl2Get.status, 200);
    assertEquals(pl1Get.status, 200);
  });
});

describe("fetchClaimableRoute", () => {
  it("should return all claimable routes", async () => {
    const gameHandler = new GameManager();
    gameHandler.createGame(
      [
        { name: "susahnth", id: "1" },
        {
          name: "susahnth",
          id: "2",
        },
        { name: "susahnth", id: "3" },
      ],
      mockedReader,
    );

    const game = gameHandler.getGame(1)?.game;
    const cards = game?.status("1").playerResources.playerHandCards!;
    const card = cards[0];
    card.count = 1;
    const color = card.color;
    const locomotive = cards.at(-1)!;
    locomotive.count = 0;

    const app: Hono = prepareApp(new Users(), gameHandler);

    const response = await app.request(
      `/game/player/claimable-routes?color=${color}`,
      {
        headers: { cookie: "user-ID=1;game-ID=1" },
      },
    );

    const expected = [
      {
        carId: "cr2",
        cityA: "c1",
        cityB: "c3",
        color: "gray",
        distance: 1,
        id: "r2",
      },
      {
        carId: "cr3",
        cityA: "c1",
        cityB: "c3",
        color: "gray",
        distance: 1,
        id: "r3",
      },
      {
        carId: "cr6",
        cityA: "c3",
        cityB: "c5",
        color: "gray",
        distance: 1,
        id: "r6",
      },
      {
        carId: "cr7",
        cityA: "c3",
        cityB: "c5",
        color: "gray",
        distance: 1,
        id: "r7",
      },
      {
        carId: "cr39",
        cityA: "c15",
        cityB: "c19",
        color: "gray",
        distance: 1,
        id: "r39",
      },
      {
        carId: "cr40",
        cityA: "c15",
        cityB: "c19",
        color: "gray",
        distance: 1,
        id: "r40",
      },
      {
        carId: "cr49",
        cityA: "c23",
        cityB: "c24",
        color: "gray",
        distance: 1,
        id: "r49",
      },
      {
        carId: "cr50",
        cityA: "c23",
        cityB: "c24",
        color: "gray",
        distance: 1,
        id: "r50",
      },
      {
        carId: "cr84",
        cityA: "c29",
        cityB: "c28",
        color: "gray",
        distance: 1,
        id: "r84",
      },
    ];

    assertEquals(await response.json(), expected);
  });

  it("should return nine claimable routes when give locomotive", async () => {
    const gameHandler = new GameManager();
    gameHandler.createGame(
      [
        { name: "susahnth", id: "1" },
        {
          name: "susahnth",
          id: "2",
        },
        { name: "susahnth", id: "3" },
      ],
      mockedReader,
    );

    const game = gameHandler.getGame(1)?.game;
    const cards = game?.status("1").playerResources.playerHandCards!;
    const locomotive = cards.at(-1)!;
    locomotive.count = 1;

    const app: Hono = prepareApp(new Users(), gameHandler);

    const response = await app.request(
      `/game/player/claimable-routes?color=locomotive`,
      {
        headers: { cookie: "user-ID=1;game-ID=1" },
      },
    );

    const expected = [
      {
        carId: "cr2",
        cityA: "c1",
        cityB: "c3",
        color: "gray",
        distance: 1,
        id: "r2",
      },
      {
        carId: "cr3",
        cityA: "c1",
        cityB: "c3",
        color: "gray",
        distance: 1,
        id: "r3",
      },
      {
        carId: "cr6",
        cityA: "c3",
        cityB: "c5",
        color: "gray",
        distance: 1,
        id: "r6",
      },
      {
        carId: "cr7",
        cityA: "c3",
        cityB: "c5",
        color: "gray",
        distance: 1,
        id: "r7",
      },
      {
        carId: "cr39",
        cityA: "c15",
        cityB: "c19",
        color: "gray",
        distance: 1,
        id: "r39",
      },
      {
        carId: "cr40",
        cityA: "c15",
        cityB: "c19",
        color: "gray",
        distance: 1,
        id: "r40",
      },
      {
        carId: "cr49",
        cityA: "c23",
        cityB: "c24",
        color: "gray",
        distance: 1,
        id: "r49",
      },
      {
        carId: "cr50",
        cityA: "c23",
        cityB: "c24",
        color: "gray",
        distance: 1,
        id: "r50",
      },
      {
        carId: "cr84",
        cityA: "c29",
        cityB: "c28",
        color: "gray",
        distance: 1,
        id: "r84",
      },
    ];

    assertEquals(await response.json(), expected);
  });
});
