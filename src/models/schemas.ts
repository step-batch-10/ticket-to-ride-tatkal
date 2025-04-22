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

interface Player {
  id: string;
  name: string;
  trainCars: number;
  trainCarCards: number;
  tickets: number;
}

interface PlayerResources extends Player {
  destinationTickets: Tickets[];
  playerHandCards: playerHandCard[];
}

interface GameStatus {
  currentPlayerID: string;
  isActive: Boolean;
  players: Player[];
  map: string;
  playerResources: PlayerResources;
  faceUpCards: card[];
  state: "setup" | "playing" | "finalTurn";
}

export type {
  card,
  CreateAppArgs,
  Game,
  GameStatus,
  Logger,
  playerHandCard,
  PlayerInfo,
  PlayerResources,
  Reader,
  ServeStatic,
  SetContextArgs,
  svg,
  Tickets,
  USAMap,
  User,
};
