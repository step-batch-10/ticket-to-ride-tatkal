import { assertEquals } from "assert";
import { describe, it } from "jsr:@std/testing/bdd";
import { ScoreBoard } from "../src/models/score_board.ts";
import { prepareTTR } from "./ttr_test.ts";
import { RouteScore } from "../src/models/schemas.ts";

describe("populate score board", () => {
  it("should give the scorecard of three players with routescores", () => {
    const ttr = prepareTTR();
    const players = ttr.getPlayers();
    const scoreBoard = new ScoreBoard(players);

    assertEquals(scoreBoard.populateScoreBoard().length, 3);
  });

  it("should create a new route score for player 1 when the player claimes route", () => {
    // deno-lint-ignore no-explicit-any
    const ttr: any = prepareTTR();
    ttr.players[0].claimedRoutes = [
      {
        id: "r1",
        carId: "cr1",
        cityA: "c1",
        cityB: "c2",
        distance: 3,
        color: "gray",
      },
    ];
    const players = ttr.getPlayers();
    const scoreBoard = new ScoreBoard(players);
    const routeScores = scoreBoard.populateScoreBoard()[0].routeScores;
    const expected: RouteScore = {
      trackLength: 3,
      points: 4,
      count: 1,
      totalPoints: 4,
    };

    assertEquals(routeScores.length, 1);
    assertEquals(routeScores[0], expected);
  });

  it("should increment count for player 1 when the player claimes route of same distance", () => {
    // deno-lint-ignore no-explicit-any
    const ttr: any = prepareTTR();
    ttr.players[0].claimedRoutes = [
      {
        id: "r3",
        carId: "cr3",
        cityA: "c1",
        cityB: "c3",
        distance: 1,
        color: "gray",
      },
      {
        id: "r2",
        carId: "cr2",
        cityA: "c1",
        cityB: "c3",
        distance: 1,
        color: "gray",
      },
    ];
    const players = ttr.getPlayers();
    const scoreBoard = new ScoreBoard(players);
    const routeScores = scoreBoard.populateScoreBoard()[0].routeScores;
    const expected: RouteScore = {
      trackLength: 1,
      points: 1,
      count: 2,
      totalPoints: 2,
    };

    assertEquals(routeScores.length, 1);
    assertEquals(routeScores[0], expected);
  });
});
