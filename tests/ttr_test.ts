import { assert, assertEquals } from "assert";
import { describe, it } from "jsr:@std/testing/bdd";
import { Ttr } from "../src/models/ttr.ts";
import { UsMap } from "../src/models/USA-map.ts";
import tickets from "../json/tickets.json" with { type: "json" };

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
        UsMap.getInstance(mockedReader),
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
        UsMap.getInstance(mockedReader),
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
        UsMap.getInstance(mockedReader),
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
        UsMap.getInstance(mockedReader),
      );

      assertEquals(ttr.getDestinationTickets().length, 3);
    });
  });
});

const prepareTTR = () =>
  Ttr.createTtr(
    [
      { name: "susahnth", id: "1" },
      { name: "susahnth", id: "2" },
      {
        name: "susahnth",
        id: "3",
      },
    ],
    UsMap.getInstance(mockedReader),
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
