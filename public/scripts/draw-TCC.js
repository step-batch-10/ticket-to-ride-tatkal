import { fetchJSON } from "./draw-tickets.js";

const changePlayer = () => {
  alert("player changed");
};

export class DrawTCC {
  #actionState = {
    STARTED: 0,
    PARTIAL: 1,
    ENDED: 2,
  };

  #currentState;

  constructor() {
    this.#currentState = this.#actionState.STARTED;
  }

  #isValidLocomotiveDraw(color) {
    return (
      this.#currentState === this.#actionState.PARTIAL && color === "locomotive"
    );
  }

  async drawFaceUpCard(index, color) {
    if (this.#isValidLocomotiveDraw(color)) {
      alert("You can't take locomotive");
      return false;
    }

    const drawnCard = await fetchJSON(
      "/game/player/drawFaceup-card",
      "POST",
      JSON.stringify({ index })
    );

    this.#currentState += drawnCard.color === "locomotive" ? 2 : 1;

    if (this.#currentState === this.#actionState.ENDED) {
      changePlayer();
      this.#currentState = this.#actionState.STARTED;
    }
  }

  async drawBlindCard() {
    const _res = await fetch("/game/player/draw-blind-card", {
      method: "POST",
    });

    this.#currentState++;

    if (this.#currentState === this.#actionState.ENDED) {
      changePlayer();
      this.#currentState = this.#actionState.STARTED;
    }
  }
}
