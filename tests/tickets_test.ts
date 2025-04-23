import { assert, assertEquals, assertFalse } from "assert";
import { describe, it } from "jsr:@std/testing/bdd";
import DestinationTickets from "../src/models/tickets.ts";
import { isSubset } from "../src/models/tickets.ts";
import tickets from "../json/tickets.json" with { type: "json" };

describe("Tickets", () => {
  it("should contain all destinations tickets that are provided", () => {
    const DT = new DestinationTickets(tickets);
    assertEquals(DT.allTickets, tickets);
  });

  it("should return the top 3 of destinationCards", () => {
    const DT = new DestinationTickets(tickets);
    assertEquals(DT.getTopThree(), tickets.slice(0, 3));
  });

  it("should return the selected tickets", () => {
    const DT = new DestinationTickets(tickets);
    assertEquals(DT.getTickets(["t1"]), [tickets[0]]);
  });

  it("should return false when ticket is invalid", () => {
    const DT = new DestinationTickets(tickets);
    assertFalse(DT.stackUnderDeck([{ ...tickets[0], id: "undefined" }]));
  });

  it("should return true when ticket is valid", () => {
    const DT = new DestinationTickets(tickets);
    const ticket = tickets[0];

    assert(DT.stackUnderDeck([ticket]));
    assertEquals(DT.avaliableTickets.at(-1), ticket);
  });
});

describe("isSubset", () => {
  it("should return boolean if it is a subset", () => {
    assert(isSubset([{ a: 1 }, { b: 3 }, { c: 5 }], [{ a: 1 }, { b: 3 }]));
    assertFalse(isSubset([{ a: 1 }, { b: 3 }, { c: 5 }], [{ a: 4 }]));
  });
});
