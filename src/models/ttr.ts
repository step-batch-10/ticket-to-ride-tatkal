import { Game, Map, svg } from "./schemas.ts";

export class Ttr implements Game {
  map: Map;

  constructor(map: Map) {
    this.map = map;
  }

  getMap(): svg {
    return this.map.getMap();
  }
}
