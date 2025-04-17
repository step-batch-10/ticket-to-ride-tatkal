export type svg = string;

export type card = {
  color: string;
};

export interface Map {
  getMap(): svg;
}

export interface Game {
  map: Map;

  getMap(): svg;
}

export type Reader = typeof Deno.readTextFileSync;
