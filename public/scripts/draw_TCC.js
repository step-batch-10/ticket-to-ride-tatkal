import { fetchJSON } from "./draw-tickets.js";
import { continueGame, showAction } from "./game.js";

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
      showAction("You can't draw locomotive", "danger");
      return false;
    }

    const drawnCard = await fetchJSON(
      "/game/player/drawFaceup-card",
      "POST",
      JSON.stringify({ index }),
    );
    showAction(`${drawnCard.color} card drawn from face up cards`);
    this.#currentState += drawnCard.color === "locomotive" ? 2 : 1;

    if (this.#currentState === this.#actionState.ENDED) {
      continueGame();
      this.#currentState = this.#actionState.STARTED;
    }
  }

  async drawBlindCard() {
    const drawnCard = await fetchJSON(
      "/game/player/draw-blind-card",
      "POST",
    );
    showAction(`${drawnCard.color} card drawn from deck`);
    this.#currentState++;

    if (this.#currentState === this.#actionState.ENDED) {
      continueGame();
      this.#currentState = this.#actionState.STARTED;
    }
  }
}
