import { Tickets } from "./schemas.ts";
import _ from "lodash";

const isSubset = <T>(superset: T[], subset: T[]): boolean => {
  return subset.every((sb) => superset.some((sp) => _.isEqual(sp, sb)));
};

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
    return this.allTickets.filter((ticket) => ids.includes(ticket.id));
  }

  stackUnderDeck(tickets: Tickets[]) {
    if (!isSubset(this.allTickets, tickets)) {
      return false;
    }

    this.avaliableTickets.push(...tickets);
    return true;
  }
}

export default DestinationTickets;
export { isSubset };
