import _ from "https://cdn.skypack.dev/lodash";
import { showAction } from "./game.js";

const fetchJSON = async (url, method = "GET", body = null) => {
  const options = { method, body };
  const response = await fetch(url, options);
  return await response.json();
};

class DestinationTickets {
  #tickets;
  #threshold;
  #selectedTickets;
  #reqUrl;

  constructor(reqUrl) {
    this.#reqUrl = reqUrl;
    this.#tickets = [];
    this.#threshold = 1;
    this.#selectedTickets = [];
  }

  async getTopThree() {
    const response = await fetch(this.#reqUrl);

    if (!response.ok) return false;

    this.#tickets = [];
    const { tickets, minimumPickup } = await response.json();
    this.#selectedTickets = [];
    this.#tickets.push(...tickets);
    this.#threshold = minimumPickup;

    return this.#tickets;
  }

  toggleSelection(id) {
    const ticket = _.find(this.#selectedTickets, { id });

    if (ticket) {
      this.#selectedTickets = _.without(this.#selectedTickets, ticket);
      return false;
    }

    this.#selectedTickets.push(_.find(this.#tickets, { id }));

    return true;
  }

  async confirmTickets(id) {
    const areEnough = this.#selectedTickets.length >= this.#threshold;
    const areValid = this.#selectedTickets.every((t) => t !== undefined);
    const triggeredTicket = _.find(this.#selectedTickets, { id });

    const body = JSON.stringify({
      selected: this.#selectedTickets,
      rest: _.without(this.#tickets, ...this.#selectedTickets),
    });

    if (!(areEnough && areValid && triggeredTicket)) return false;
    showAction(`Drawn ${this.#selectedTickets.length} ticket(s)`);
    const res = await fetch(this.#reqUrl, {
      method: "POST",
      body,
    });
    return res.ok;
  }
}

export { DestinationTickets, fetchJSON };
