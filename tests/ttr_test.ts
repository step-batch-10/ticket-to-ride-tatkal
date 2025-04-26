import { assert, assertEquals, assertFalse } from "assert";
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

describe("Ttr", () => {
  describe("getMap", () => {
    it("should return map", () => {
      const ttr = Ttr.createTtr(
        [
          { name: "susahnth", id: "1" },
          {
            name: "susahnth",
            id: "3",
          },
          { name: "susahnth", id: "2" },
        ],
        USAMap.getInstance(mockedReader),
      );
      assertEquals(ttr.getMap(), "usa map");
    });
  });

  describe("getFaceUpCards", () => {
    it("should return an array of length 5 faceup cards", () => {
      const ttr = Ttr.createTtr(
        [
          { name: "susahnth", id: "1" },
          {
            name: "susahnth",
            id: "3",
          },
          { name: "susahnth", id: "2" },
        ],
        USAMap.getInstance(mockedReader),
      );
      assertEquals(ttr.getFaceUpCards().length, 5);
    });
  });

  describe("getPlayers", () => {
    it("should return an array players", () => {
      const ttr = Ttr.createTtr(
        [
          { name: "susahnth", id: "1" },
          { name: "susahnth", id: "3" },
          {
            name: "susahnth",
            id: "2",
          },
        ],
        USAMap.getInstance(mockedReader),
      );
      assertEquals(ttr.getPlayers().length, 3);
    });
  });

  describe("getDestinationTickets", () => {
    it("should return 3 destination tickets", () => {
      const ttr = Ttr.createTtr(
        [
          { name: "susahnth", id: "1" },
          { name: "susahnth", id: "3" },
          {
            name: "susahnth",
            id: "2",
          },
        ],
        USAMap.getInstance(mockedReader),
      );

      assertEquals(ttr.getDestinationTickets().length, 3);
    });
  });
});

export const prepareTTR = (tcc?: TrainCarCards) =>
  Ttr.createTtr(
    [
      { name: "susahnth", id: "1" },
      { name: "susahnth", id: "2" },
      {
        name: "susahnth",
        id: "3",
      },
    ],
    USAMap.getInstance(mockedReader),
    tcc,
  );

describe("getTopThree destination tickets", () => {
  it("should return the top 3 tickets from the overall cards", () => {
    const ttr = prepareTTR();

    const desTickets = ttr.getDestinationTickets();

    assertEquals(desTickets, tickets.slice(0, 3));
  });
});

describe("draw face up card", () => {
  it("should return first face up card", () => {
    const ttr = prepareTTR();
    const faceUpCard = ttr.getFaceUpCards()[0];
    const drawnCard = ttr.drawFaceUpCard(0);

    assertEquals(faceUpCard, drawnCard);
  });

  it("should return 4th face up card", () => {
    const ttr = prepareTTR();
    const faceUpCard = ttr.getFaceUpCards()[3];
    const drawnCard = ttr.drawFaceUpCard(3);

    assertEquals(faceUpCard, drawnCard);
  });
});

describe("get current player", () => {
  it("it should return first player as current player", () => {
    const ttr = prepareTTR();

    assertEquals(ttr.getCurrentPlayer().getId(), "1");
  });
});

describe("change Player ", () => {
  it("should change the current player to next player", () => {
    const ttr = prepareTTR();

    assertEquals(ttr.getCurrentPlayer().getId(), "1");
    assert(ttr.changePlayer());
    assertEquals(ttr.getCurrentPlayer().getId(), "2");
  });

  it("should change the game state once all setup moves are done", () => {
    const ttr = prepareTTR();

    ttr.changePlayer();
    ttr.changePlayer();
    ttr.changePlayer();

    assertEquals(ttr.getState(), "playing");
  });
});

describe("can perform destionation tickets action", () => {
  it("should allow to take destination tickets if it is the starrting action in the player's turn ", () => {
    const ttr = prepareTTR();

    assert(ttr.canGetDestTickets());
    ttr.addDestinationTicketsTo("1", []);
    assert(ttr.canGetDestTickets());
  });

  it("should not allow to take destination tickets if any action is initiated in the player's turn ", () => {
    const ttr = prepareTTR();

    assert(ttr.canGetDestTickets());
    ttr.getDestinationTickets();
    assertFalse(ttr.canGetDestTickets());
    ttr.getFaceUpCards();
    assertFalse(ttr.canGetDestTickets());
  });

  it("should allow to choose destination tickets if the player has shown the 3 tickets", () => {
    const ttr = prepareTTR();

    ttr.getDestinationTickets();
    assert(ttr.canChooseDestTickets());
  });

  it("should not allow to choose destination tickets if the player has not shown the 3 tickets", () => {
    const ttr = prepareTTR();

    assertFalse(ttr.canChooseDestTickets());
  });
});

describe("can draw train car cards", () => {
  it("should allow the player to draw a card if the player chose to draw train car cards", () => {
    const ttr = prepareTTR();

    assert(ttr.canDrawATCC());
    ttr.drawFaceUpCard(1);
    assert(ttr.canDrawATCC());
    ttr.drawBlindCard();
  });

  it("should not allow the player to draw a locomotive if the player already drew one train car card", () => {
    const tcc = new TrainCarCards();
    tcc.drawFaceUp = (_: number): card => ({ color: "red" });

    const ttr: Ttr = prepareTTR(tcc);

    ttr.drawFaceUpCard(1);
    assertFalse(ttr.canDrawATCC("locomotive"));
  });

  it("should not allow the player to draw a card if the player initiated any other action", () => {
    const ttr = prepareTTR();

    ttr.getDestinationTickets();
    assertFalse(ttr.canDrawATCC());
  });
});

describe("claimRoute ", () => {
  it("should return true when route is claimed", () => {
    // deno-lint-ignore no-explicit-any
    const ttr: any = prepareTTR();
    ttr.players[0].hand = [{ color: "red", count: 1 }, {
      color: "locomotive",
      count: 0,
    }];

    assert(ttr.claimRoute("1", "r2", "red"));
  });

  it("should return false when route is not claimed", () => {
    // deno-lint-ignore no-explicit-any
    const ttr: any = prepareTTR();
    ttr.players[0].hand = [{ color: "red", count: 1 }, {
      color: "locomotive",
      count: 0,
    }];

    assertFalse(ttr.claimRoute("1", "r25", "red"));
  });

  it("should return false when route color does'nt match with card color", () => {
    // deno-lint-ignore no-explicit-any
    const ttr: any = prepareTTR();
    ttr.players[0].hand = [{ color: "yellow", count: 5 }, {
      color: "locomotive",
      count: 0,
    }];

    assertFalse(ttr.claimRoute("1", "r25", "yellow"));
  });

  it("should return true when card color is locomotive and the count is greater than distance", () => {
    // deno-lint-ignore no-explicit-any
    const ttr: any = prepareTTR();
    ttr.players[0].hand = [{
      color: "locomotive",
      count: 4,
    }];

    assert(ttr.claimRoute("1", "r25", "locomotive"));
  });

  it("should initiate the final turn if current player has less than 3 train cars", () => {
    // deno-lint-ignore no-explicit-any
    const ttr: any = prepareTTR();
    ttr.players[0].hand = [{
      color: "locomotive",
      count: 4,
    }];
    ttr.currentPlayer.trainCars = 5;
    ttr.claimRoute("1", "r25", "locomotive");

    assertEquals(ttr.getState(), "finalTurn");
  });

  it("should not initiate the final turn if current player has more than 3 train cars", () => {
    // deno-lint-ignore no-explicit-any
    const ttr: any = prepareTTR();
    ttr.players[0].hand = [{
      color: "locomotive",
      count: 4,
    }];
    ttr.currentPlayer.trainCars = 8;
    ttr.claimRoute("1", "r25", "locomotive");
    assertEquals(ttr.getState(), "setup");
  });

  it("should not initiate final turn again if its already initiated", () => {
    // deno-lint-ignore no-explicit-any
    const ttr: any = prepareTTR();
    ttr.players[0].hand = [{
      color: "locomotive",
      count: 4,
    }];

    ttr.currentPlayer.trainCars = 5;

    ttr.claimRoute("1", "r25", "locomotive");

    ttr.changePlayer();

    ttr.players[1].hand = [{
      color: "locomotive",
      count: 4,
    }];

    ttr.currentPlayer.trainCars = 3;
    ttr.claimRoute("2", "r2", "locomotive");

    assertEquals(ttr.finalTurnInitiator, "1");
  });
  it("should end game if final turn", () => {
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

describe("get minimumPickUp of destinationCards", () => {
  it("should return 2 during the setup phase", () => {
    const ttr = prepareTTR();
    assertEquals(ttr.getState(), "setup");
    assertEquals(ttr.getMinimumPickUp(), 2);
  });
  it("should return 1 during the playing phase", () => {
    const ttr = prepareTTR();
    ttr.changePlayer();
    ttr.changePlayer();
    ttr.changePlayer();

    assertEquals(ttr.getState(), "playing");
    assertEquals(ttr.getMinimumPickUp(), 1);
  });
});
