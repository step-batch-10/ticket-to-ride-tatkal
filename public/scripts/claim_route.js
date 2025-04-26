import { continueGame } from "./game.js";
import { fetchJSON } from "./draw_tickets.js";

export class ClaimRoute {
  #cardColor;

  constructor() {
    this.#cardColor = "";
  }

  assignCardColor(color) {
    this.#cardColor = color;
  }

  async claimRoute(routeId) {
    const body = JSON.stringify({ routeId, cardColor: this.#cardColor });
    const res = await fetchJSON("/game/player/claim-route", "POST", body);

    if (res.claimed) continueGame();
  }
}
