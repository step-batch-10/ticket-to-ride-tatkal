import { Map, svg } from "./schemas.ts";
import { Reader } from "./schemas.ts";
export class UsMap implements Map {
  svg: svg;

  constructor(reader: Reader) {
    this.svg = reader("src/models/USA-map.html");
  }

  getMap(): svg {
    return this.svg;
  }
}
