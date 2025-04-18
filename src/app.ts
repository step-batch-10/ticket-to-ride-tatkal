import { Context, Hono, Next } from "hono";
import { GameHandler } from "./models/game-handlers.ts";
import { Reader } from "./models/schemas.ts";
import { getCookie, setCookie } from "hono/cookie";
import { Logger, ServeStatic } from "./types.ts";
import { Users } from "./models/users.ts";
import {
  addToWaitingQueue,
  getQueue,
  redirectToGame,
} from "./handlers/waiting-handler.ts";
import {
  fetchFaceUps,
  fetchMap,
  fetchPlayerDetails,
  fetchPlayerHand,
} from "./handlers/gameHandler.ts";

const setContext =
  (reader: Reader, users: Users, gameHandler: GameHandler) =>
  async (context: Context, next: Next) => {
    context.set("reader", reader);
    context.set("users", users);
    context.set("gameHandler", gameHandler);
    const gameId = Number(getCookie(context, "game-ID"));
    if (gameId) {
      const game = gameHandler.getGame(gameId)?.game;
      context.set("game", game);
    }
    await next();
  };

const authenticateUser = async (c: Context, next: Next) => {
  const userID: string | undefined = getCookie(c, "user-ID");

  if (!userID) {
    return c.redirect("/login.html", 303);
  }

  await next();
};

const handleLogin = async (c: Context) => {
  const fd: Object = await c.req.parseBody();
  const user = c.get("users");
  const userID: string = user.add(fd);

  setCookie(c, "user-ID", userID);
  return c.redirect("/", 303);
};

const fetchTicketChoices = (c: Context) => {
  const ticketChoices = {
    tickets: [
      {
        id: 1,
        from: "LA",
        to: "chicago",
        points: 10,
      },
      {
        id: 2,
        from: "vancour",
        to: "chicago",
        points: 10,
      },
      {
        id: 3,
        from: "miami",
        to: "chicago",
        points: 10,
      },
    ],
    mininumPickup: 2,
  };

  return c.json(ticketChoices);
};
const createApp = (
  logger: Logger,
  serveStatic: ServeStatic,
  reader: Reader,
  users: Users,
  gameHandler: GameHandler,
): Hono => {
  const app: Hono = new Hono();
  // for testing purpose created game
  gameHandler.createGame([{name:'susahnth', id:'1'}, {name:'susahnth', id:'3'}, {name:'susahnth', id:'2'}], reader);
  app.use(logger());
  app.use(setContext(reader, users, gameHandler));

  app.get("/login.html", serveStatic({ root: "./public" }));
  app.get("/styles/login.css", serveStatic({ root: "./public" }));
  app.get("/scripts/login.js", serveStatic({ root: "./public" }));
  app.post("/login", handleLogin);

  app.use("/*", authenticateUser);
  app.post("/wait", addToWaitingQueue);
  app.get("/waiting-list", getQueue);
  app.get("/redirectToGame", redirectToGame);
  // game routes
  app.get("/game/map", fetchMap);
  app.get("/game/face-up-cards", fetchFaceUps);
  // player routes
  app.get("/game/player/hand", fetchPlayerHand);
  app.get("/game/destination-tickets", fetchTicketChoices);
  app.get("/game/players-detail", fetchPlayerDetails);
  app.get("/*", serveStatic({ root: "./public" }));
  return app;
};

export { createApp };
