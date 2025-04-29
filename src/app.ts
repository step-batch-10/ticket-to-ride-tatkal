import { Context, Hono, Next } from "hono";
import { getCookie } from "hono/cookie";
import { handleLogin, handleLogout } from "./handlers/user_handler.ts";
import {
  CreateAppArgs,
  ServeStatic,
  SetContextArgs,
} from "./models/schemas.ts";
import {
  addToWaitingQueue,
  getQueue,
  redirectToGame,
} from "./handlers/waiting_handler.ts";
import {
  drawCardFromDeck,
  drawFaceUpCard,
  fetchClaimableRoute,
  fetchFaceUps,
  fetchGameStatus,
  fetchMap,
  fetchPlayerDetails,
  fetchPlayerHand,
  fetchScoreCard,
  fetchTicketChoices,
  handleClaimRoute,
  updatePlayerTickets,
} from "./handlers/game_handler.ts";
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
  const currentPlayer: Player = game.getCurrentPlayer();
  const playerId = getCookie(context, "user-ID");

  if (playerId === currentPlayer.getId()) {
    await next();
  }

  return context.json({}, 409);
};

const canPerformGetDT = async (context: Context, next: Next) => {
  const game = context.get("game");

  if (game.canGetDestTickets()) await next();

  return context.json({ message: "invalid", isError: true }, 403);
};

const canPerformSelectDT = async (context: Context, next: Next) => {
  const game = context.get("game");

  if (game.canChooseDestTickets()) await next();

  return context.json({ message: "invalid", isError: true }, 403);
};

const canPerformDrawTCC = async (context: Context, next: Next) => {
  const game = context.get("game");
  const { color } = await context.req.json();

  if (game.canDrawATCC(color)) await next();

  return context.json({ message: "invalid", isError: true }, 403);
};

const canPerformClaimRoute = async (context: Context, next: Next) => {
  const game = context.get("game");

  if (game.canPerformClaimRoute()) await next();

  return context.json({ message: "invalid", isError: true }, 403);
};

const playerRoutes = (): Hono => {
  const player: Hono = new Hono();
  player.use(setPlayerContext);
  player.get("/properties", fetchPlayerHand);
  player.get("/status", fetchGameStatus);
  player.get("/claimable-routes", fetchClaimableRoute);

  player.use(authenticatePlayerMove);
  player.get("/destination-tickets", canPerformGetDT, fetchTicketChoices);
  player.post("/destination-tickets", canPerformSelectDT, updatePlayerTickets);
  player.post("/draw-blind-card", canPerformDrawTCC, drawCardFromDeck);
  player.post("/draw-faceup-card", canPerformDrawTCC, drawFaceUpCard);
  player.post("/claim-route", canPerformClaimRoute, handleClaimRoute);

  return player;
};

const gameRoutes = (): Hono => {
  const game: Hono = new Hono();

  game.get("/map", fetchMap);
  game.get("/face-up-cards", fetchFaceUps);
  game.get("/players-detail", fetchPlayerDetails);
  game.get("/setup/destination-tickets", fetchTicketChoices);
  game.post("/setup/destination-tickets", updatePlayerTickets);
  game.get("/scoreCard", fetchScoreCard);
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
