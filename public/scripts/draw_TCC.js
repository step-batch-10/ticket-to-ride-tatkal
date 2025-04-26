import { fetchJSON } from "./draw_tickets.js";
import { showAction } from "./game.js";

export class DrawTCC {
  #showAppropriateMessage(drawnCard) {
    const message = !drawnCard.isError
      ? `${drawnCard.color} card drawn from face up cards`
      : drawnCard.message;

    showAction(message);
  }

  async drawFaceUpCard(index, color) {
    const drawnCard = await fetchJSON(
      "/game/player/draw-faceup-card",
      "POST",
      JSON.stringify({ index, color })
    );

    this.#showAppropriateMessage(drawnCard);
  }

  async drawBlindCard() {
    const drawnCard = await fetchJSON(
      "/game/player/draw-blind-card",
      "POST",
      JSON.stringify({})
    );

    this.#showAppropriateMessage(drawnCard);
  }
}
