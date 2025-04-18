import { card, Game, svg, USAMap } from "./schemas.ts";
import { TrainCarCards } from "./train-car-cards.ts";

export class Ttr implements Game {
  players: string[];
  map: USAMap;
  trainCarCards;

  constructor(players: string[], map: USAMap) {
    this.players = players;
    this.map = map;
    this.trainCarCards = new TrainCarCards();
  }

  getMap(): svg {
    return this.map.getMap();
  }

  getFaceUpCards(): card[] {
    return this.trainCarCards.getFaceUpCards();
  }
}
