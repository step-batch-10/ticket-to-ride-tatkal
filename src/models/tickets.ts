import { Tickets } from "./schemas.ts";
import _ from "lodash";

class DestinationTickets {
  readonly tickets: Tickets[];

  constructor(tickets: Tickets[]) {
    this.tickets = tickets;
  }

  getTopThree() {
    return this.tickets.splice(-3);
  }
}
export default DestinationTickets;
