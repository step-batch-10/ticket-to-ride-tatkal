import { fetchJSON } from "./draw_tickets.js";
import { showAction } from "./game.js";

export class DrawTCC {
  #showAppropriateMessage(drawnCard, from) {
    console.log(drawnCard);

    if (drawnCard.isError || drawnCard.color === undefined) {
      showAction("you cant draw card", "danger");
    } else {
      showAction(`${drawnCard.color} card drawn from ${from} cards`);
    }
  }

  async drawFaceUpCard(index, color) {
    const drawnCard = await fetchJSON(
      "/game/player/draw-faceup-card",
      "POST",
      JSON.stringify({ index, color }),
    );

    this.#showAppropriateMessage(drawnCard, "face up");
  }

  async drawBlindCard() {
    const drawnCard = await fetchJSON(
      "/game/player/draw-blind-card",
      "POST",
      JSON.stringify({}),
    );

    this.#showAppropriateMessage(drawnCard, "blind");
  }
}
