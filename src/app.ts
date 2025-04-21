import { Context, Hono, Next } from "hono";
import { getCookie, setCookie } from "hono/cookie";
import { MyCxt } from "./types.ts";

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
import { Ttr } from "./models/ttr.ts";

const setContext = (args: MyCxt) => async (c: Context, next: Next) => {
  const { reader, users, gameHandler } = args;

  c.set("reader", reader);
  c.set("users", users);
  c.set("gameHandler", gameHandler);
  const gameId = Number(getCookie(c, "game-ID"));
  if (gameId) {
    const game = gameHandler.getGame(gameId)?.game;
    c.set("game", game);
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
  const userInfo: Object = await c.req.parseBody();
  const users = c.get("users");
  const userID: string = users.add(userInfo);

  setCookie(c, "user-ID", userID);
  return c.redirect("/", 303);
};

const fetchTicketChoices = (c: Context) => {
  const TTR: Ttr = c.get("game");
  // will return top 3 DT cards.

  const destinationTicketsInfo = {
    tickets: TTR.getDestinationTickets(),
    minimumPickup: 2,
  };

  return c.json(destinationTicketsInfo);
};

const updatePlayerTickets = async (c: Context) => {
  const ids = await c.req.json();
  const playerID = getCookie(c, "user-ID");
  const game = c.get("game");
  game.addDestinationTicketsTo(playerID, ids.ticketIds);

  return c.text("ok", 200);
};

const createApp = (args: MyCxt): Hono => {
  const { logger, serveStatic } = args;

  const guest = new Hono();
  guest.get("/login.html", serveStatic({ root: "./public" }));
  guest.get("/styles/login.css", serveStatic({ root: "./public" }));
  guest.get("/scripts/login.js", serveStatic({ root: "./public" }));
  guest.post("/login", handleLogin);

  const user: Hono = new Hono();
  user.post("/wait", addToWaitingQueue);
  user.get("/waiting-list", getQueue, redirectToGame);
  user.get("/redirectToGame", redirectToGame);

  const game: Hono = new Hono();
  game.get("/game/map", fetchMap);
  game.get("/game/face-up-cards", fetchFaceUps);
  game.get("/game/players-detail", fetchPlayerDetails); // /game/players
  game.get("/game/destination-tickets", fetchTicketChoices);

  const player: Hono = new Hono();
  player.get("/game/player/properties", fetchPlayerHand);
  player.post("/game/destination-tickets", updatePlayerTickets);

  const app: Hono = new Hono();
  app.use(logger());
  app.use(setContext(args));
  app.route("/", guest);
  app.use(authenticateUser);
  app.route("/", user);
  app.route("/", game);
  app.route("/", player);
  app.get(serveStatic({ root: "./public" }));

  return app;
};

export { createApp };
