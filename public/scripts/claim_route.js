export class ClaimRoute {
  #cardColor;

  constructor() {
    this.#cardColor = null;
  }

  assignCardColor(event) {
    this.#cardColor = event.target.classList[1];
  }

  async claimRoute(event) {
    const routeId = event.target.id;
    await fetch("/game/player/claim-route", {
      method: "POST",
      body: JSON.stringify({ routeId, cardColor: this.#cardColor }),
    });
  }
}
