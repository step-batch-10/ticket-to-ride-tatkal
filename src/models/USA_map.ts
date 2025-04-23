import { type svg, Tickets, type USAMap } from "./schemas.ts";
import { Reader } from "./schemas.ts";
import DestinationTickets from "./tickets.ts";

export class UsMap implements USAMap {
  #svg: svg;
  private destinationTickets;

  constructor(svg: string, tickets: Tickets[]) {
    this.#svg = svg;
    this.destinationTickets = new DestinationTickets(tickets);
  }

  getMap(): svg {
    return this.#svg;
  }

  getDestinationTickets(): DestinationTickets {
    return this.destinationTickets;
  }

  static getInstance(reader: Reader) {
    const svg = reader("public/USA_map.html");
    const tickets = reader("json/tickets.json");
    return new UsMap(svg, JSON.parse(tickets));
  }
}
