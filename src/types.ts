import { logger } from "hono/logger";
import { serveStatic } from "hono/deno";

type Logger = typeof logger;
type ServeStatic = typeof serveStatic;

interface User {
  username: String;
}

type PlayerInfo = {
  name: string;
  id: string;
};

export type { Logger, PlayerInfo, ServeStatic, User };
