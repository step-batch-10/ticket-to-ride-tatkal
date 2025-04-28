import { assert, assertEquals, assertFalse } from "assert";
import { describe, it } from "jsr:@std/testing/bdd";
import DestinationTickets from "../src/models/tickets.ts";
import { isSubset } from "../src/models/tickets.ts";
import tickets from "../json/tickets.json" with { type: "json" };

describe("Test for Tickets class", () => {
  describe("when destination tickets are initialized", () => {
    it("should contain all destinations tickets that are provided", () => {
      const DT = new DestinationTickets(tickets);

      assertEquals(DT.allTickets, tickets);
    });
  });

  describe("when the method getTopThree is called", () => {
    it("should return the top 3 of destinationCards", () => {
      const DT = new DestinationTickets(tickets);

      assertEquals(DT.getTopThree(), tickets.slice(0, 3));
    });
  });

  describe("when getTickets is called with an existing id of ticket", () => {
    it("should return the selected tickets when it exists", () => {
      const DT = new DestinationTickets(tickets);

      assertEquals(DT.getTickets(["t1"]), [tickets[0]]);
    });
  });

  describe("when getTickets is called with a non existing id of ticket", () => {
    it("should return an empty list when it doesn't exist", () => {
      const DT = new DestinationTickets(tickets);

      assertEquals(DT.getTickets(["t50"]), []);
    });
  });

  describe("when a valid ticket is discarded", () => {
    it("should place the card under the deck and return true", () => {
      const DT = new DestinationTickets(tickets);
      const ticket = tickets[0];

      assert(DT.stackUnderDeck([ticket]));
      assertEquals(DT.avaliableTickets.at(-1), ticket);
    });
  });

  describe("when an invalid ticket is discarded", () => {
    it("should place the card under the deck and return true", () => {
      const DT = new DestinationTickets(tickets);
      const ticket = { "id": "t321", "from": "c8", "to": "c32", "points": 21 };

      assertFalse(DT.stackUnderDeck([ticket]));
    });
  });
});

describe("Test for isSubset function", () => {
  it("should return boolean if it is a subset", () => {
    const set1 = [{ a: 1 }, { b: 3 }, { c: 5 }];
    const set2 = [{ a: 1 }, { b: 3 }];

    assert(isSubset(set1, set2));

    const set3 = [{ a: 1 }, { b: 3 }, { c: 5 }];
    const set4 = [{ a: 4 }];

    assertFalse(isSubset(set3, set4));
  });
});
