export type svg = string;
export interface Map {
  svg: svg;
  getMap(): svg;
}
export interface Game {
  map: Map;

  getMap(): svg;
}

export type Reader = typeof Deno.readTextFileSync;
