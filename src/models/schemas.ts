import { logger } from "hono/logger";
import { serveStatic } from "hono/deno";
import { Users } from "./users.ts";
import { GameManager } from "./game_manager.ts";
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

type Route = {
  id: string;
  carId: string;
  cityA: string;
  cityB: string;
  distance: number;
  color: string;
};

type ClaimedRoute = {
  carId: string;
  playerColor: string;
};

type City = {
  id: string;
  name: string;
};

interface Tickets {
  id: string;
  from: string;
  to: string;
  points: number;
  completed?: boolean;
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

type ActivityLog = {
  playerName: string;
  from: string;
  assets: string | number;
};

interface GameStatus {
  currentPlayerID: string;
  isActive: Boolean;
  players: Player[];
  playerResources: PlayerResources;
  faceUpCards: card[];
  state: "setup" | "playing" | "finalTurn" | "end";
  logs: ActivityLog[];
  claimedRoutes: ClaimedRoute[];
}

type RouteScore = {
  trackLength: number;
  points: number;
  count: number;
  totalPoints: number;
};

type PlayerScore = {
  playerId: string;
  playerName: string;
  routeScores: RouteScore[];
  destinationTickets: Tickets[];
  longestPath?: number;
  bonusPoints?: number;
};

type GameScoreSummary = {
  playerName: string;
  routeScore: number;
  destinationScore: number;
  totalScore: number;
  bonusPoints?: number;
};

export type {
  ActivityLog,
  card,
  City,
  ClaimedRoute,
  CreateAppArgs,
  Game,
  GameScoreSummary,
  GameStatus,
  Logger,
  playerHandCard,
  PlayerInfo,
  PlayerResources,
  PlayerScore,
  Reader,
  Route,
  RouteScore,
  ServeStatic,
  SetContextArgs,
  svg,
  Tickets,
  User,
};
