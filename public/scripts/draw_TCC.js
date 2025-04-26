import { fetchJSON } from "./draw_tickets.js";
import { showAction } from "./game.js";

export class DrawTCC {
  async drawFaceUpCard(index, color) {
    const drawnCard = await fetchJSON(
      "/game/player/draw-faceup-card",
      "POST",
      JSON.stringify({ index, color }),
    );

    showAction(`${drawnCard.color} card drawn from face up cards`);
  }

  async drawBlindCard() {
    const drawnCard = await fetchJSON(
      "/game/player/draw-blind-card",
      "POST",
      JSON.stringify({}),
    );

    showAction(`${drawnCard.color} card drawn from deck`);
  }
}
