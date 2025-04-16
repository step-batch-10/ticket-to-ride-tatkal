import { logger } from "hono/logger";
import { serveStatic } from "hono/deno";

type Logger = typeof logger;
type ServeStatic = typeof serveStatic;

export type { Logger, ServeStatic };
