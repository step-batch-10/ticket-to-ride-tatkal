import { card, Game, Map, svg } from "./schemas.ts";
import { TrainCarCards } from "./train-car-cards.ts";

export class Ttr implements Game {
  players: string[];
  map: Map;
  trainCarCards;

  constructor(players: string[], map: Map) {
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
