import { logger } from "hono/logger";
import { serveStatic } from "hono/deno";

type Logger = typeof logger;
type ServeStatic = typeof serveStatic;

interface user {
  username: String;
}

export type { Logger, ServeStatic, user };
