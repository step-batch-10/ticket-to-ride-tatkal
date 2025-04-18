import { assert, assertEquals } from "assert";
import { describe, it } from "jsr:@std/testing/bdd";
import { GameHandler } from "../src/models/game-handlers.ts";

const mockedReader = (_path: string | URL): string => {
  return "usa map";
};

describe("Game Handler", () => {
  it("should add to Queue", () => {
    const gameHandler = new GameHandler();
    const actual = gameHandler.addToQueue({ name: "sushanth", id: "1" });
    assert(actual);
  });

  it("Should return waiting List", () => {
    const gameHandler = new GameHandler();
    gameHandler.addToQueue({ name: "sushanth", id: "1" });
    gameHandler.addToQueue({ name: "sarup", id: "2" });
    gameHandler.addToQueue({ name: "hari", id: "3" });

    assertEquals(gameHandler.getWaitingList("sushanth"), [
      "sushanth",
      "sarup",
      "hari",
    ]);
  });

  it("should create a game and return game id", () => {
    const gameHandler = new GameHandler();
    gameHandler.addToQueue({ name: "sushanth", id: "1" });
    gameHandler.addToQueue({ name: "Sarup", id: "2" });
    gameHandler.addToQueue({ name: "hari", id: "3" });
    const playerInfo = [{ name: "sushanth", id: "1" },{ name: "Sarup", id: "2" },{ name: "hari", id: "3" }];

    const gameId = gameHandler.createGame(playerInfo, mockedReader);

    assertEquals(gameId, 1);
  });

  it("should return a game when the gameId is given", () => {
    const gameHandler = new GameHandler();
    gameHandler.addToQueue({ name: "sushanth", id: "1" });
    gameHandler.addToQueue({ name: "Sarup", id: "2" });
    gameHandler.addToQueue({ name: "hari", id: "3" });
    const playerInfo = [{ name: "sushanth", id: "1" },{ name: "Sarup", id: "2" },{ name: "hari", id: "3" }];

    const gameId = gameHandler.createGame(playerInfo, mockedReader);
 const actual = gameHandler.getGame(gameId);
    const game = actual?.game;
    const expected = {
      gameId: 1,
      players: [
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
      game,
    };

    assertEquals(actual, expected);
  });
});
