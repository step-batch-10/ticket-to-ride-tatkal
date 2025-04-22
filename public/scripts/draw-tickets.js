import _ from "https://cdn.skypack.dev/lodash";

const fetchJSON = async (url) => {
  const response = await fetch(url);
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

  async confirmTickets() {
    const areEnough = this.#selectedTickets.length >= this.#threshold;
    const areValid = this.#selectedTickets.every((t) => t !== undefined);

    if (!(areEnough && areValid)) return false;

    const res = await fetch("/game/player/destination-tickets", {
      method: "POST",
      body: JSON.stringify({ tickets: this.#selectedTickets }),
    });

    return res.ok;
  }
}

export { DestinationTickets, fetchJSON };
