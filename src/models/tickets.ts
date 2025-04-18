import { Tickets } from "./schemas.ts";

class DestinationTickets {
  readonly tickets: Tickets[];

  constructor(tickets: Tickets[]) {
    this.tickets = tickets;
  }
}

export default DestinationTickets;
