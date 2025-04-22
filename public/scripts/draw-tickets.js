import _ from "https://cdn.skypack.dev/lodash";

const fetchJSON = async (url, method = "GET", body = null) => {
  const options = { method, body };
  const response = await fetch(url, options);
  return await response.json();
};

class DestinationTickets {
  #tickets;
  #threshold;
  #selectedTickets;

  constructor() {
    this.#tickets = [];
    this.#threshold = 1;
    this.#selectedTickets = [];
  }

  async getTopThree() {
    const { tickets, minimumPickup } = await fetchJSON(
      "/game/destination-tickets",
    );

    this.#tickets.unshift(...tickets);
    this.#threshold = minimumPickup;

    return this.#tickets.slice(0, 3);
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

    if (!(areEnough && areValid && triggeredTicket)) return false;

    const res = await fetch("/game/player/destination-tickets", {
      method: "POST",
      body: JSON.stringify({
        selected: this.#selectedTickets,
        rest: _.without(this.#tickets, ...this.#selectedTickets),
      }),
    });

    return res.ok;
  }
}

export { DestinationTickets, fetchJSON };
