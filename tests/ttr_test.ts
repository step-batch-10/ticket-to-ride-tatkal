import { assertEquals } from "assert";
import { describe, it } from "jsr:@std/testing/bdd";
import { Ttr } from "../src/models/ttr.ts";
import { UsMap } from "../src/models/UsMap.ts";
import tickets from "../src/models/tickets.json" with { type: "json" };

const mockedReader = (_path: string | URL): string => {
  // deno-lint-ignore no-explicit-any
  const loc: any = _path;
  console.log(loc, "==================");
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
      { name: "susahnth", id: "3" },
      {
        name: "susahnth",
        id: "2",
      },
    ],
    UsMap.getInstance(mockedReader),
  );

describe("getTopThree destination tickets", () => {
  it("should return the top 3 tickets from the overall cards", () => {
    const ttr = prepareTTR();

    const desTickets = ttr.getDestinationTickets();

    assertEquals(desTickets, tickets.slice(-3));
  });
});
