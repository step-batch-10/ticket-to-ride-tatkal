import { assert, assertEquals } from "assert";
import { describe, it } from "jsr:@std/testing/bdd";
import { GameHandler } from "../src/models/game-handlers.ts";
import { Ttr } from "../src/models/ttr.ts";
import { UsMap } from "../src/models/UsMap.ts";

const mockedReader = (_path: string | URL): string => {
  return "usa map";
};

describe("Game Handler", () => {
  it("should add to Queue", () => {
    const gameHandler = new GameHandler();
    const actual = gameHandler.addToQueue("Dhanoj");
    assert(actual);
  });

  it("Should not add a player and return false", () => {
    const gameHandler = new GameHandler();
    gameHandler.addToQueue("Dhanoj");
    gameHandler.addToQueue("sarup");
    gameHandler.addToQueue("hari");

    assertEquals(gameHandler.addToQueue("Anjali"), false);
  });

  it("Should return waiting List", () => {
    const gameHandler = new GameHandler();
    gameHandler.addToQueue("Dhanoj");
    gameHandler.addToQueue("sarup");
    gameHandler.addToQueue("hari");

    assertEquals(gameHandler.getWaitingList(), ["Dhanoj", "sarup", "hari"]);
  });

  it("should create a game and return game id", () => {
    const gameHandler = new GameHandler();
    gameHandler.addToQueue("Dhanoj");
    gameHandler.addToQueue("Sarup");
    gameHandler.addToQueue("Anjali");
    const gameId = gameHandler.createGame(mockedReader);

    assertEquals(gameId, 1);
  });

  it("should return a game when the gameId is given", () => {
    const gameHandler = new GameHandler();
    gameHandler.addToQueue("Dhanoj");
    gameHandler.addToQueue("Sarup");
    gameHandler.addToQueue("Anjali");
    const gameId = gameHandler.createGame(mockedReader);
    const actual = gameHandler.getGame(gameId);
    const expected = {
      gameId: 1,
      game: new Ttr(
        ["Dhanoj", "Sarup", "Anjali"],
        UsMap.getInstance(mockedReader),
      ),
    };

    assertEquals(actual, expected);
  });
});
