import { logger } from "hono/logger";
import { serveStatic } from "hono/deno";
import { Users } from "./users.ts";
import { GameManager } from "./game-handlers.ts";
import { Ttr } from "./ttr.ts";

type Logger = typeof logger;
type ServeStatic = typeof serveStatic;
type Reader = typeof Deno.readTextFileSync;

type User = {
  username: String;
};

type PlayerInfo = {
  name: string;
  id: string;
};

type Game = {
  gameId: number;
  players: PlayerInfo[];
  game: Ttr;
};

interface SetContextArgs {
  users: Users;
  gameHandler: GameManager;
  reader?: Reader;
}

interface CreateAppArgs extends SetContextArgs {
  logger: Logger;
  serveStatic: ServeStatic;
}

type svg = string;

type card = {
  color: string;
};

interface Tickets {
  id: string;
  from: string;
  to: string;
  points: number;
}

interface USAMap {
  getMap(): svg;
}

type playerHandCard = {
  color: string;
  count: number;
};

export type {
  CreateAppArgs,
  Logger,
  PlayerInfo,
  ServeStatic,
  SetContextArgs,
  User,
  Game,
  playerHandCard,
  USAMap,
  Tickets,
  card,
  svg,
  Reader,
};
