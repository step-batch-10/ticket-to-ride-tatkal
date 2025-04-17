import { type Map, type svg } from "./schemas.ts";
import { Reader } from "./schemas.ts";

export class UsMap implements Map {
  #svg: svg;

  constructor(svg: string) {
    this.#svg = svg;
  }

  getMap(): svg {
    return this.#svg;
  }

  static getInstance(reader: Reader) {
    const svg = reader("src/models/USA-map.html");
    return new UsMap(svg);
  }
}
