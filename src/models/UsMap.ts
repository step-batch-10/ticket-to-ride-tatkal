import { type svg, type USAMap } from "./schemas.ts";
import { Reader } from "./schemas.ts";

export class UsMap implements USAMap {
  #svg: svg;

  constructor(svg: string) {
    this.#svg = svg;
  }

  getMap(): svg {
    return this.#svg;
  }

  static getInstance(reader: Reader) {
    const svg = reader("public/USA-map.html");
    return new UsMap(svg);
  }
}
