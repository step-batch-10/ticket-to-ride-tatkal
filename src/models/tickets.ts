import { Tickets } from "./schemas.ts";
import _ from "lodash";

class DestinationTickets {
  readonly avaliableTickets: Tickets[];
  readonly allTickets;

  constructor(tickets: Tickets[]) {
    this.allTickets = tickets;
    this.avaliableTickets = [...tickets];
  }

  getTopThree() {
    return this.avaliableTickets.splice(0, 3);
  }

  getTickets(ids: string[]) {
    const t = this.allTickets.filter((ticket) => ids.includes(ticket.id));
    return t;
  }

  stackUnderDeck(tickets: Tickets[]) {
    if (!tickets.every((t) => _.includes(this.allTickets, t))) {
      return false;
    }

    this.avaliableTickets.push(...tickets);
    return true;
  }
}

export default DestinationTickets;
