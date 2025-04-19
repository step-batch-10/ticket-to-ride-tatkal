import { assertEquals } from "assert";
import { describe, it } from "jsr:@std/testing/bdd";
import DestinationTickets from "../src/models/tickets.ts";
import tickets from "../src/models/tickets.json" with { type: "json" };

describe("Tickets", () => {
  it("should contain all destinations tickets that are provided", () => {
    const DT = new DestinationTickets(tickets);
    assertEquals(DT.AllTickets, tickets);
  });

  it("should return the top 3 of destinationCards", () => {
    const DT = new DestinationTickets(tickets);
    assertEquals(DT.getTopThree(), tickets.slice(-3));
  });

  it("should return the selected tickets", () => {
    const DT = new DestinationTickets(tickets);
    assertEquals(DT.getTickets(["1"]), [tickets[0]]);
  });
});
