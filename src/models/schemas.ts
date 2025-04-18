export type svg = string;

export type card = {
  color: string;
};

export interface USAMap {
  getMap(): svg;
}

export interface Game {
  map: USAMap;

  getMap(): svg;
}

export type Reader = typeof Deno.readTextFileSync;
