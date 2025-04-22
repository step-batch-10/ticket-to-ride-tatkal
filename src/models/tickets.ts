import { Tickets } from "./schemas.ts";
import _ from "lodash";

class DestinationTickets {
  readonly avaliableTickets: Tickets[];
  readonly AllTickets;

  constructor(tickets: Tickets[]) {
    this.AllTickets = tickets;
    this.avaliableTickets = [...tickets];
  }

  getTopThree() {
    return this.avaliableTickets.slice(-3);
  }

  getTickets(ids: string[]) {
    return this.AllTickets.filter((ticket) => ids.includes(ticket.id));
  }
}
export default DestinationTickets;
