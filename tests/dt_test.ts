import { assertEquals } from "assert";
import { describe, it } from "jsr:@std/testing/bdd";
import DestinationTickets from "../src/models/tickets.ts";

describe("Tickets", () => {
  it("should return all destinations tickets that are provided", () => {
    const tickets = [
      {
        id: "1",
        from: "LA",
        to: "chicago",
        points: 10,
      },
      {
        id: "2",
        from: "vancour",
        to: "chicago",
        points: 10,
      },
      {
        id: "3",
        from: "miami",
        to: "chicago",
        points: 10,
      },
    ];

    const DT = new DestinationTickets(tickets);
    assertEquals(DT.tickets, tickets);
  });
});
