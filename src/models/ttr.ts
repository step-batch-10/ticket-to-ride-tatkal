import { Game, Map, svg } from "./schemas.ts";

export class Ttr implements Game {
  players: string[];
  map: Map;

  constructor(players: string[], map: Map) {
    this.players = players;
    this.map = map;
  }

  getMap(): svg {
    return this.map.getMap();
  }
}
