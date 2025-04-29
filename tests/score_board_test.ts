import { assertEquals } from "assert";
import { describe, it } from "jsr:@std/testing/bdd";
import { ScoreBoard } from "../src/models/score_board.ts";
import { prepareTTR } from "./ttr_test.ts";
import { Player } from "../src/models/player.ts";
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

describe("awardLongestPathBonus", () => {
  it("should return updated scores with bonus point and longest path", () => {
    const player = new Player({ name: "sushanth", id: "1" }, "red");
    const route = {
      id: "r3",
      carId: "cr3",
      cityA: "c1",
      cityB: "c3",
      distance: 1,
      color: "gray",
    };

    player.addClaimedRoute(route);
    player.addEdge(route);

    const scoreBoard = new ScoreBoard([player]);
    const actual = scoreBoard.awardLongestPathBonus([{}]);
    const expected = [{ longestPathLength: 1, bonusPoints: 10 }];

    assertEquals(actual, expected);
  });

  it("should return updated scores with bonus point and longest path for two players", () => {
    const player1 = new Player({ name: "sushanth", id: "1" }, "red");
    const route1 = {
      id: "r3",
      carId: "cr3",
      cityA: "c1",
      cityB: "c3",
      distance: 1,
      color: "gray",
    };

    player1.addClaimedRoute(route1);
    player1.addEdge(route1);

    const player2 = new Player({ name: "sarup", id: "2" }, "red");
    const route2 = {
      id: "r1",
      carId: "cr1",
      cityA: "c1",
      cityB: "c2",
      distance: 3,
      color: "gray",
    };

    player2.addClaimedRoute(route2);
    player2.addEdge(route2);

    const scoreBoard = new ScoreBoard([player1, player2]);
    const actual = scoreBoard.awardLongestPathBonus([{}, {}]);
    const expected = [
      { longestPathLength: 1, bonusPoints: 0 },
      { longestPathLength: 3, bonusPoints: 10 },
    ];

    assertEquals(actual, expected);
  });

  it("should return updated scores with same bonus point and longest path for two players", () => {
    const player1 = new Player({ name: "sushanth", id: "1" }, "red");
    const route = {
      id: "r1",
      carId: "cr1",
      cityA: "c1",
      cityB: "c2",
      distance: 3,
      color: "gray",
    };
    player1.addClaimedRoute(route);
    player1.addEdge(route);
    const player2 = new Player({ name: "sarup", id: "2" }, "red");
    player2.addClaimedRoute(route);
    player2.addEdge(route);

    const scoreBoard = new ScoreBoard([player1, player2]);
    const actual = scoreBoard.awardLongestPathBonus([{}, {}]);
    const expected = [
      { longestPathLength: 3, bonusPoints: 10 },
      { longestPathLength: 3, bonusPoints: 10 },
    ];

    assertEquals(actual, expected);
  });
});

describe("playerScoreCard", () => {
  const route = {
    id: "r1",
    carId: "cr1",
    cityA: "c1",
    cityB: "c2",
    distance: 3,
    color: "gray",
  };
  const ticket = {
    id: "1",
    from: "c1",
    to: "c3",
    points: 2,
  };

  it("should return completed destination tickets", () => {
    const player = new Player({ name: "sushanth", id: "1" }, "red");
    const scoreboard = new ScoreBoard([player]);

    player.addDestinationTickets([ticket]);
    player.addEdge(route);
    player.addEdge({ ...route, cityA: "c2", cityB: "c3" });
    scoreboard.getCompletedDestination(player);

    assertEquals(scoreboard.getDestinationTickets(), [
      { ...ticket, completed: true },
    ]);
  });

  it("should return completed destination tickets", () => {
    const player = new Player({ name: "sushanth", id: "1" }, "red");
    const scoreboard = new ScoreBoard([player]);

    player.addDestinationTickets([{ ...ticket, to: "c4" }]);
    player.addEdge(route);
    player.addEdge({ ...route, cityA: "c1", cityB: "c3" });
    player.addEdge({ ...route, cityA: "c2", cityB: "c4" });
    scoreboard.getCompletedDestination(player);

    assertEquals(scoreboard.getDestinationTickets(), [
      { ...ticket, to: "c4", completed: true },
    ]);
  });

  it("should return false when destination is incomplete.", () => {
    const player = new Player({ name: "sushanth", id: "1" }, "red");
    const scoreboard = new ScoreBoard([player]);

    player.addDestinationTickets([{ ...ticket, to: "c4" }]);
    player.addEdge(route);
    player.addEdge({ ...route, cityA: "c1", cityB: "c3" });
    // player.addEdge({ ...route, cityA: "c2", cityB: "c4" });
    scoreboard.getCompletedDestination(player);

    assertEquals(scoreboard.getDestinationTickets(), [
      { ...ticket, to: "c4", completed: false },
    ]);
  });
});
