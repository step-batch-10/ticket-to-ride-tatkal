import { assert, assertEquals } from "assert";
import { describe, it } from "jsr:@std/testing/bdd";
import { GameManager } from "../src/models/game_manager.ts";
import tickets from "../json/tickets.json" with { type: "json" };
import { assignRouteCities } from "../src/handlers/game_handler.ts";
import cities from "../json/cities.json" with { type: "json" };

const mockedReader = (_path: string | URL): string => {
  // deno-lint-ignore no-explicit-any
  const loc: any = _path;
  if (loc.endsWith(".json")) {
    return JSON.stringify(tickets);
  }

  return "usa map";
};

describe("Test for GameManager class", () => {
  describe("when a player is added to queue", () => {
    it("should return true", () => {
      const gameManager = new GameManager();
      const actual = gameManager.addToQueue({ name: "sushanth", id: "1" }, 3);

      assert(actual);
    });
  });

  describe("when getWaitingList is called", () => {
    it("should return the waiting List of added players", () => {
      const gameManager = new GameManager();
      gameManager.addToQueue({ name: "sushanth", id: "1" }, 3);
      gameManager.addToQueue({ name: "sarup", id: "2" }, 3);
      gameManager.addToQueue({ name: "hari", id: "3" }, 3);

      const actual = gameManager.getWaitingList("1");

      assertEquals(actual, {
        maxPlayers: 3,
        players: [
          { name: "sushanth", id: "1" },
          { name: "sarup", id: "2" },
          { name: "hari", id: "3" },
        ],
      });
    });
  });

  describe("when enough players are added for game", () => {
    it("should create a game and return game id", () => {
      const gameManager = new GameManager();

      gameManager.addToQueue({ name: "sushanth", id: "1" }, 3);
      gameManager.addToQueue({ name: "Sarup", id: "2" }, 3);
      gameManager.addToQueue({ name: "hari", id: "3" }, 3);

      const playerInfo = [
        { name: "sushanth", id: "1" },
        { name: "Sarup", id: "2" },
        { name: "hari", id: "3" },
      ];

      const gameId = gameManager.createGame(playerInfo, mockedReader);

      assertEquals(gameId, 1);
    });
  });

  describe("when the gameId is given", () => {
    it("should return a game", () => {
      const gameManager = new GameManager();

      gameManager.addToQueue({ name: "sushanth", id: "1" }, 3);
      gameManager.addToQueue({ name: "Sarup", id: "2" }, 3);
      gameManager.addToQueue({ name: "hari", id: "3" }, 3);

      const playerInfo = [
        { name: "sushanth", id: "1" },
        { name: "Sarup", id: "2" },
        { name: "hari", id: "3" },
      ];

      const gameId = gameManager.createGame(playerInfo, mockedReader);
      const actual = gameManager.getGame(gameId);

      assertEquals(actual?.gameId, 1);
      assertEquals(actual?.players, playerInfo);
      assertEquals(actual?.game.getState(), "setup");
    });
  });
});

describe("Test for assignRouteCities", () => {
  it("should return tickets with city names", () => {
    const ticket = { from: "c8", id: "t1", points: 21, to: "c32" };

    const expectedFromCity = "Los Angeles";
    const expectedToCity = "New York";

    const [actual] = assignRouteCities(cities, [ticket]);

    assertEquals(actual.id, ticket.id);
    assertEquals(actual.from, ticket.from);
    assertEquals(actual.to, ticket.to);
    assertEquals(actual.points, ticket.points);
    assertEquals(actual.fromCity, expectedFromCity);
    assertEquals(actual.toCity, expectedToCity);
  });
});
