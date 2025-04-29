import { assert, assertEquals, assertFalse, assertNotEquals } from "assert";
import { describe, it } from "jsr:@std/testing/bdd";
import { Ttr } from "../src/models/ttr.ts";
import { USAMap } from "../src/models/USA_map.ts";
import tickets from "../json/tickets.json" with { type: "json" };
import { TrainCarCards } from "../src/models/train_car_cards.ts";
import { card } from "../src/models/schemas.ts";

const mockedReader = (_path: string | URL): string => {
  // deno-lint-ignore no-explicit-any
  const loc: any = _path;
  if (loc.endsWith(".json")) {
    return JSON.stringify(tickets);
  }

  return "usa map";
};

export const prepareTTR = (tcc?: TrainCarCards) =>
  Ttr.createTtr(
    [
      { name: "sushanth", id: "1" },
      { name: "dhanoj", id: "2" },
      { name: "sarup", id: "3" },
    ],
    USAMap.getInstance(mockedReader),
    tcc,
  );

describe("Test for Ttr class", () => {
  describe("when ask for map after a ttr game is created", () => {
    it("should return map and the state is setup", () => {
      const ttr = prepareTTR();

      assertEquals(ttr.getMap(), "usa map");
      assertEquals(ttr.getState(), "setup");
    });
  });

  describe("the total face up cards by getFaceUpCards method", () => {
    it("should return an array of length 5 faceup cards", () => {
      const ttr = prepareTTR();
      assertEquals(ttr.getFaceUpCards().length, 5);
    });
  });

  describe("the total players by getPlayers method", () => {
    it("should return an array players", () => {
      const ttr = prepareTTR();
      const allPlayers = ttr.getPlayers();

      assertEquals(allPlayers.length, 3);

      assertEquals(allPlayers[0].getId(), "1");
      assertEquals(allPlayers[1].getId(), "2");
      assertEquals(allPlayers[2].getId(), "3");
    });
  });

  describe("all players get 3 destination tickets to choose from", () => {
    it("should return an array of length 3", () => {
      const ttr = prepareTTR();

      assertEquals(ttr.getDestinationTickets().length, 3);
    });
  });

  describe("getTopThree destination tickets", () => {
    it("should return the top 3 tickets from the overall cards", () => {
      const ttr = prepareTTR();

      const desTickets = ttr.getDestinationTickets();

      assertEquals(desTickets, tickets.slice(0, 3));
    });
  });

  describe("when face up card is drawn", () => {
    it("should return that face up card", () => {
      const ttr = prepareTTR();

      const faceUpCard1 = ttr.getFaceUpCards()[0];
      const drawnCard1 = ttr.drawFaceUpCard(0);

      assertEquals(faceUpCard1, drawnCard1);

      const faceUpCard2 = ttr.getFaceUpCards()[3];
      const drawnCard2 = ttr.drawFaceUpCard(3);

      assertEquals(faceUpCard2, drawnCard2);
    });
  });

  describe("when getCurrentPLayer is called", () => {
    it("should return first player's id", () => {
      const ttr = prepareTTR();

      assertEquals(ttr.getCurrentPlayer().getId(), "1");
    });
  });

  describe("when Player is changed", () => {
    it("should give current player as next player's id", () => {
      const ttr = prepareTTR();

      assertEquals(ttr.getCurrentPlayer().getId(), "1");
      assert(ttr.changePlayer());
      assertEquals(ttr.getCurrentPlayer().getId(), "2");
    });
  });

  describe("when all players are done with seup moves", () => {
    it("should change the game state to playing", () => {
      const ttr = prepareTTR();

      assertEquals(ttr.getState(), "setup");

      ttr.changePlayer();
      ttr.changePlayer();
      ttr.changePlayer();

      assertEquals(ttr.getState(), "playing");
    });
  });

  describe("can get destionation tickets action", () => {
    it("should allow if it is the starting action in the player's turn ", () => {
      const ttr = prepareTTR();
      assert(ttr.canGetDestTickets());

      ttr.addDestinationTicketsTo("1", []);
      assert(ttr.canGetDestTickets());
    });

    it("should not allow if an action is already initiated", () => {
      const ttr = prepareTTR();
      assert(ttr.canGetDestTickets());

      ttr.getDestinationTickets();
      assertFalse(ttr.canGetDestTickets());

      ttr.getFaceUpCards();
      assertFalse(ttr.canGetDestTickets());
    });

    it("should allow if the player is shown the 3 tickets", () => {
      const ttr = prepareTTR();

      ttr.getDestinationTickets();
      assert(ttr.canChooseDestTickets());
    });

    it("should not allow if the player is not shown the 3 tickets", () => {
      const ttr = prepareTTR();

      assertFalse(ttr.canChooseDestTickets());
    });
  });

  describe("can draw train car cards action", () => {
    it("should allow the player if the player chose to draw train car cards", () => {
      const ttr = prepareTTR();
      assert(ttr.canDrawATCC());

      ttr.drawFaceUpCard(1);
      assert(ttr.canDrawATCC());

      assert(ttr.drawBlindCard());
    });

    it("should not allow the player to draw a locomotive if the player already drew one train car card", () => {
      const tcc = new TrainCarCards();
      tcc.drawFaceUp = (_: number): card => ({ color: "red" });

      const ttr: Ttr = prepareTTR(tcc);

      ttr.drawFaceUpCard(1);
      assertFalse(ttr.canDrawATCC("locomotive"));
    });

    it("should not allow if the player initiated other action", () => {
      const ttr = prepareTTR();

      ttr.getDestinationTickets();
      assertFalse(ttr.canDrawATCC());
    });

    it("should change the player if the player drew 2 train car cards", () => {
      const tcc = new TrainCarCards();
      tcc.drawFaceUp = (_: number): card => ({ color: "red" });
      const ttr: Ttr = prepareTTR(tcc);

      const initialPLayer = ttr.getCurrentPlayer();

      ttr.drawFaceUpCard(1);
      ttr.drawFaceUpCard(2);

      assertNotEquals(initialPLayer, ttr.getCurrentPlayer());
    });
  });

  describe("when a route is successfully claimed", () => {
    it("should return true", () => {
      // deno-lint-ignore no-explicit-any
      const ttr: any = prepareTTR();
      ttr.players[0].hand = [
        { color: "red", count: 1 },
        { color: "locomotive", count: 0 },
      ];

      assert(ttr.claimRoute("1", "r2", "red"));
    });

    it("should return true when card color is locomotive and the count is greater than distance", () => {
      // deno-lint-ignore no-explicit-any
      const ttr: any = prepareTTR();
      ttr.players[0].hand = [{
        color: "locomotive",
        count: 10,
      }];

      assert(ttr.claimRoute("1", "r5", "locomotive"));
    });
  });

  describe("when a route is not claimed", () => {
    it("should return false", () => {
      // deno-lint-ignore no-explicit-any
      const ttr: any = prepareTTR();
      ttr.players[0].hand = [
        { color: "red", count: 1 },
        { color: "locomotive", count: 0 },
      ];

      assertFalse(ttr.claimRoute("1", "r25", "red"));
    });

    it("should return false when route color does'nt match with card color", () => {
      // deno-lint-ignore no-explicit-any
      const ttr: any = prepareTTR();
      ttr.players[0].hand = [{ color: "green", count: 5 }, {
        color: "locomotive",
        count: 0,
      }];

      assertFalse(ttr.claimRoute("1", "r5", "yellow"));
    });
  });

  describe(
    "when current player has less than 3 train cars after route claim ",
    () => {
      it("should initiate the final round", () => {
        // deno-lint-ignore no-explicit-any
        const ttr: any = prepareTTR();
        assertEquals(ttr.getState(), "setup");

        ttr.players[0].hand = [{
          color: "locomotive",
          count: 4,
        }];

        ttr.currentPlayer.trainCars = 5;
        ttr.claimRoute("1", "r25", "locomotive");

        assertEquals(ttr.getState(), "finalTurn");
      });
    },
  );

  describe("when the final turn is done", () => {
    it("should end game", () => {
      // deno-lint-ignore no-explicit-any
      const ttr: any = prepareTTR();

      ttr.players[0].hand = [{
        color: "locomotive",
        count: 4,
      }];

      ttr.currentPlayer.trainCars = 5;
      ttr.claimRoute("1", "r25", "locomotive");

      ttr.changePlayer();
      ttr.changePlayer();
      ttr.changePlayer();

      assertEquals(ttr.getState(), "end");
    });
  });

  describe("when the game is in setup phase", () => {
    it("should return 2 for minimum pickup", () => {
      const ttr = prepareTTR();

      assertEquals(ttr.getState(), "setup");
      assertEquals(ttr.getMinimumPickUp(), 2);
    });
  });

  describe("when the game is in playing phase", () => {
    it("should return 1 for minimum pickup", () => {
      const ttr = prepareTTR();
      ttr.changePlayer();
      ttr.changePlayer();
      ttr.changePlayer();

      assertEquals(ttr.getState(), "playing");
      assertEquals(ttr.getMinimumPickUp(), 1);
    });
  });

  describe("when the game ends get scoreCard", () => {
    it("should return scoreCard", () => {
      const ttr = prepareTTR();
      const expected = [
        {
          destinationTickets: [],
          playerName: "sushanth",
          playerId: "1",
          routeScores: [],
        },
        {
          destinationTickets: [],
          playerName: "dhanoj",
          playerId: "2",
          routeScores: [],
        },
        {
          destinationTickets: [],
          playerName: "sarup",
          playerId: "3",
          routeScores: [],
        },
      ];

      assertEquals(ttr.getScoreCard(), expected);
    });
  });
});
