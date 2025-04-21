import { logger } from "hono/logger";
import { serveStatic } from "hono/deno";
import { Users } from "./models/users.ts";
import { GameManager } from "../src/models/game-handlers.ts";

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

type CreateAppArgs = {
  logger: Logger;
  serveStatic: ServeStatic;
  users: Users;
  gameHandler: GameManager;
  reader?: Reader;
};
type SetContextArgs = {
  users: Users;
  gameHandler: GameHandler;
  reader?: Reader;
};

export type {
  Logger,
  CreateAppArgs,
  PlayerInfo,
  ServeStatic,
  SetContextArgs,
  User,
};
