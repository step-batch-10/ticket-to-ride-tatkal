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

interface SetContextArgs {
  users: Users;
  gameHandler: GameManager;
  reader?: Reader;
}

interface CreateAppArgs extends SetContextArgs {
  logger: Logger;
  serveStatic: ServeStatic;
}

export type {
  CreateAppArgs,
  Logger,
  PlayerInfo,
  ServeStatic,
  SetContextArgs,
  User,
};
