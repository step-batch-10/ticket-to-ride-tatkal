import { assertEquals } from "assert";
import { describe, it } from "jsr:@std/testing/bdd";
import { ScoreBoard } from "../src/models/score_board.ts";
import { prepareTTR } from "./ttr_test.ts";
import { Player } from "../src/models/player.ts";
import { RouteScore } from "../src/models/schemas.ts";

describe("populate player score board", () => {
  it("should give the scorecard of three players with routescores", () => {
    const ttr = prepareTTR();
    const players = ttr.getPlayers();
    const scoreBoard = new ScoreBoard(players);

    assertEquals(scoreBoard.populatePlayerScoreBoard().length, 3);
  });

  it("should create a new route score for player 1 when the player claimes route", () => {
    // deno-lint-ignore no-explicit-any
    const ttr: any = prepareTTR();
    const route0 = {
      id: "r10",
      carId: "cr10",
      cityA: "c5",
      cityB: "c7",
      distance: 5,
      color: "pink",
      isDoubleRoute: false,
      siblingRouteId: null,
    };
    ttr.players[0].addClaimedRoute(route0);
    ttr.players[0].addEdge(route0);
    const players = ttr.getPlayers();
    const scoreBoard = new ScoreBoard(players);
    const routeScores = scoreBoard.populatePlayerScoreBoard()[0].routeScores;
    const expected: RouteScore = {
      trackLength: 5,
      points: 10,
      count: 1,
      totalPoints: 10,
    };

    assertEquals(routeScores.length, 1);
    assertEquals(routeScores[0], expected);
  });

  it("should increment count for player 1 when the player claimes route of same distance", () => {
    // deno-lint-ignore no-explicit-any
    const ttr: any = prepareTTR();
    const route0 = {
      id: "r10",
      carId: "cr10",
      cityA: "c5",
      cityB: "c7",
      distance: 5,
      color: "pink",
      isDoubleRoute: false,
      siblingRouteId: null,
    };
    const route1 = {
      id: "r75",
      carId: "cr75",
      cityA: "c16",
      cityB: "c33",
      distance: 5,
      color: "black",
      isDoubleRoute: false,
      siblingRouteId: null,
    };
    ttr.players[0].addClaimedRoute(route0);
    ttr.players[0].addEdge(route0);
    ttr.players[0].addClaimedRoute(route1);
    ttr.players[0].addEdge(route1);

    const players = ttr.getPlayers();
    const scoreBoard = new ScoreBoard(players);
    const routeScores = scoreBoard.populatePlayerScoreBoard()[0].routeScores;
    const expected: RouteScore = {
      trackLength: 5,
      points: 10,
      count: 2,
      totalPoints: 20,
    };

    assertEquals(routeScores.length, 1);
    assertEquals(routeScores[0], expected);
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
    isDoubleRoute: false,
    siblingRouteId: null,
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

    assertEquals(scoreboard.populatePlayerScoreBoard()[0].destinationTickets, [
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
    scoreboard.populatePlayerScoreBoard();

    assertEquals(scoreboard.populatePlayerScoreBoard()[0].destinationTickets, [
      { ...ticket, to: "c4", completed: true },
    ]);
  });

  it("should return false when destination is incomplete.", () => {
    const player = new Player({ name: "sushanth", id: "1" }, "red");
    const scoreboard = new ScoreBoard([player]);

    player.addDestinationTickets([{ ...ticket, to: "c4" }]);
    player.addEdge(route);
    player.addEdge({ ...route, cityA: "c1", cityB: "c3" });
    scoreboard.populatePlayerScoreBoard();

    assertEquals(scoreboard.populatePlayerScoreBoard()[0].destinationTickets, [
      { ...ticket, to: "c4", completed: false },
    ]);
  });

  it("should return false when destination is incomplete.", () => {
    const player = new Player({ name: "sushanth", id: "1" }, "red");
    const scoreboard = new ScoreBoard([player]);

    player.addDestinationTickets([{ ...ticket, to: "c4" }]);

    assertEquals(scoreboard.populatePlayerScoreBoard()[0].destinationTickets, [
      { ...ticket, to: "c4", completed: false },
    ]);
  });
});

describe("populate game score summary", () => {
  it("should give game summary of three player", () => {
    const ttr = prepareTTR();
    const players = ttr.getPlayers();
    const scoreBoard = new ScoreBoard(players);
    const gameScoreSummary = scoreBoard.populateGameScoreSummary();

    assertEquals(gameScoreSummary.length, 3);
  });

  it("should give total score of first player as route score", () => {
    // deno-lint-ignore no-explicit-any
    const ttr: any = prepareTTR();
    const route0 = {
      id: "r10",
      carId: "cr10",
      cityA: "c5",
      cityB: "c7",
      distance: 5,
      color: "pink",
      isDoubleRoute: false,
      siblingRouteId: null,
    };
    ttr.players[0].addClaimedRoute(route0);
    ttr.players[0].addEdge(route0);
    const players = ttr.getPlayers();
    const scoreBoard = new ScoreBoard(players);
    const { routeScore, totalScore } = scoreBoard.populateGameScoreSummary()[1];

    assertEquals(routeScore, 0);
    assertEquals(totalScore, 0);
  });

  it("should give total score as route score and bonus points", () => {
    // deno-lint-ignore no-explicit-any
    const ttr: any = prepareTTR();
    const route0 = {
      id: "r10",
      carId: "cr10",
      cityA: "c5",
      cityB: "c7",
      distance: 5,
      color: "pink",
      isDoubleRoute: false,
      siblingRouteId: null,
    };
    const route1 = {
      id: "r72",
      carId: "cr72",
      cityA: "c18",
      cityB: "c30",
      distance: 3,
      color: "black",
      isDoubleRoute: false,
      siblingRouteId: null,
    };

    ttr.players[0].addClaimedRoute(route0);
    ttr.players[0].addEdge(route0);
    ttr.players[1].addClaimedRoute(route1);
    ttr.players[1].addEdge(route1);
    const players = ttr.getPlayers();
    const scoreBoard = new ScoreBoard(players);
    const { routeScore, totalScore } = scoreBoard.populateGameScoreSummary()[0];

    assertEquals(routeScore, 10);
    assertEquals(totalScore, 20);
  });

  it("should give total score as sum of route score destination score and bonus points", () => {
    // deno-lint-ignore no-explicit-any
    const ttr: any = prepareTTR();
    const route = {
      id: "r1",
      carId: "cr1",
      cityA: "c1",
      cityB: "c2",
      distance: 3,
      color: "gray",
      isDoubleRoute: false,
      siblingRouteId: null,
    };
    const ticket = {
      id: "1",
      from: "c1",
      to: "c3",
      points: 2,
    };
    ttr.players[0].addDestinationTickets([ticket]);
    ttr.players[0].addEdge(route);
    ttr.players[0].addEdge({ ...route, cityA: "c2", cityB: "c3" });

    const players = ttr.getPlayers();
    const scoreBoard = new ScoreBoard(players);
    const { destinationScore, totalScore } =
      scoreBoard.populateGameScoreSummary()[0];

    assertEquals(destinationScore, 2);
    assertEquals(totalScore, 12);
  });
});

describe("getWinner", () => {
  it("should give player1 as winner", () => {
    // deno-lint-ignore no-explicit-any
    const ttr: any = prepareTTR();
    const route0 = {
      id: "r10",
      carId: "cr10",
      cityA: "c5",
      cityB: "c7",
      distance: 5,
      color: "pink",
    };
    const route1 = {
      id: "r72",
      carId: "cr72",
      cityA: "c18",
      cityB: "c30",
      distance: 3,
      color: "black",
    };

    ttr.players[0].addClaimedRoute(route0);
    ttr.players[0].addEdge(route0);
    ttr.players[1].addClaimedRoute(route1);
    ttr.players[1].addEdge(route1);
    const players = ttr.getPlayers();

    const scoreBoard = new ScoreBoard(players);
    const winner: string = scoreBoard.getWinner();

    assertEquals(winner, "sushanth");
  });

  it("should give winner who completed more destinations", () => {
    // deno-lint-ignore no-explicit-any
    const ttr: any = prepareTTR();

    const route = {
      id: "r1",
      carId: "cr1",
      cityA: "c1",
      cityB: "c2",
      distance: 4,
      color: "gray",
    };

    const route1 ={
      "id": "r2",
      "carId": "cr2",
      "cityA": "c1",
      "cityB": "c3",
      "distance": 1,
      "color": "gray"
    };

    const ticket = {
      id: "1",
      from: "c1",
      to: "c3",
      points: 16,
    };

    ttr.players[1].addDestinationTickets([ticket]);

    ttr.players[0].addClaimedRoute(route);
    ttr.players[0].addEdge(route);
    ttr.players[1].addClaimedRoute(route1);
    ttr.players[1].addEdge(route1);

    const players = ttr.getPlayers();
    const scoreBoard = new ScoreBoard(players);
    const winner: string = scoreBoard.getWinner();

    assertEquals(winner, "dhanoj");
  });
});
