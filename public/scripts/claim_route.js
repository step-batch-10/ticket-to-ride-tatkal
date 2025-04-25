import { continueGame } from "./game.js";

export class ClaimRoute {
  #cardColor;

  constructor() {
    this.#cardColor = "";
  }

  assignCardColor(color) {
    this.#cardColor = color;
  }

  async claimRoute(routeId) {
    await fetch("/game/player/claim-route", {
      method: "POST",
      body: JSON.stringify({ routeId, cardColor: this.#cardColor }),
    });

    continueGame();
  }
}
