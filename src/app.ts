import { Context, Hono, Next } from "hono";
import { getCookie } from "hono/cookie";
import { handleLogin, handleLogout } from "./handlers/user-handler.ts";
import {
  CreateAppArgs,
  ServeStatic,
  SetContextArgs,
} from "./models/schemas.ts";
import {
  addToWaitingQueue,
  getQueue,
  redirectToGame,
} from "./handlers/waiting-handler.ts";
import {
  changePlayer,
  drawCardFromDeck,
  drawFaceUpCard,
  fetchFaceUps,
  fetchGameStatus,
  fetchMap,
  fetchPlayerDetails,
  fetchPlayerHand,
  fetchTicketChoices,
  updatePlayerTickets,
} from "./handlers/game-handler.ts";
import { Player } from "./models/player.ts";

const setContext = (args: SetContextArgs) => async (c: Context, next: Next) => {
  const { reader, users, gameHandler } = args;
  const gameId = Number(getCookie(c, "game-ID"));

  c.set("reader", reader);
  c.set("users", users);
  c.set("gameHandler", gameHandler);

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

const guestRoutes = (serveStatic: ServeStatic): Hono => {
  const guest = new Hono();

  guest.get("/login.html", serveStatic({ root: "./public" }));
  guest.get("/styles/login.css", serveStatic({ root: "./public" }));
  guest.get("/scripts/login.js", serveStatic({ root: "./public" }));
  guest.post("/login", handleLogin);

  return guest;
};

const userRoutes = (): Hono => {
  const user: Hono = new Hono();

  user.delete("/logout", handleLogout);
  user.post("/wait", addToWaitingQueue);
  user.get("/waiting-list", getQueue, redirectToGame);
  user.get("/redirectToGame", redirectToGame);

  return user;
};

const setPlayerContext = async (context: Context, next: Next) => {
  const game = context.get("game");
  context.set("currentPlayer", game.getCurrentPlayer());
  await next();
};

const authenticatePlayerMove = async (context: Context, next: Next) => {
  const game = context.get("game");
  context.set("currentPlayer", game.getCurrentPlayer());
  const currentPlayer: Player = context.get("currentPlayer");

  const playerId = getCookie(context, "user-ID");
  console.log("=> ", playerId, currentPlayer.getId(), game.getState());
  if (playerId === currentPlayer.getId() || game.getState() === "setup") {
    await next();
  }

  return context.text("", 409);
};

const playerRoutes = (): Hono => {
  const player: Hono = new Hono();
  player.use(setPlayerContext);
  player.get("/properties", fetchPlayerHand);
  player.get("/status", fetchGameStatus);

  player.use(authenticatePlayerMove);
  player.post("/destination-tickets", updatePlayerTickets);
  player.post("/draw-blind-card", drawCardFromDeck);
  player.post("/drawFaceup-card", drawFaceUpCard);
  player.patch("/done", changePlayer);

  return player;
};

const gameRoutes = (): Hono => {
  const game: Hono = new Hono();

  game.get("/map", fetchMap);
  game.get("/face-up-cards", fetchFaceUps);
  game.get("/players-detail", fetchPlayerDetails); // /players
  game.get("/destination-tickets", authenticatePlayerMove, fetchTicketChoices);
  game.route("/player", playerRoutes());

  return game;
};

const createApp = (args: CreateAppArgs): Hono => {
  const { serveStatic, logger, gameHandler, users, reader } = args;
  const app: Hono = new Hono();

  app.use(logger());
  app.use(setContext({ reader, users, gameHandler }));
  app.route("/", guestRoutes(serveStatic));
  app.use(authenticateUser);

  app.route("/", userRoutes());
  app.route("/game", gameRoutes());
  app.get(serveStatic({ root: "./public" }));

  return app;
};

export { createApp };
