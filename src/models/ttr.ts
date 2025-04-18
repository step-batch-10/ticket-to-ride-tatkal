import { card, Game, svg, USAMap } from "./schemas.ts";
import { TrainCarCards } from "./train-car-cards.ts";
import { Player } from "./player.ts";
export class Ttr implements Game {
  players: Player[];
  map: USAMap;
  trainCarCards;

  constructor(players: Player[], map: USAMap) {
    this.players = players;
    this.map = map;
    this.trainCarCards = new TrainCarCards();
  }

  static createTtr(players: string[], map: USAMap) {
    const playerInstances = players.map((playerId) => {
      return new Player(playerId);
    });
    return new Ttr (playerInstances, map)
  }

  getMap(): svg {
    return this.map.getMap();
  }

  getFaceUpCards(): card[] {
    return this.trainCarCards.getFaceUpCards();
  }
}
