import { Context, Hono, Next } from "hono";
import { getCookie, setCookie } from "hono/cookie";
import { CreateAppArgs, ServeStatic, SetContextArgs } from "./types.ts";
import {
  addToWaitingQueue,
  getQueue,
  redirectToGame,
} from "./handlers/waiting-handler.ts";
import {
  drawCardFromDeck,
  drawFaceUpCard,
  fetchFaceUps,
  fetchMap,
  fetchPlayerDetails,
  fetchPlayerHand,
} from "./handlers/gameHandler.ts";
import { Ttr } from "./models/ttr.ts";

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

const handleLogin = async (c: Context) => {
  const userInfo: Object = await c.req.parseBody();
  const users = c.get("users");
  const userID: string = users.add(userInfo);

  setCookie(c, "user-ID", userID);
  return c.redirect("/", 303);
};

const fetchTicketChoices = (c: Context) => {
  const TTR: Ttr = c.get("game");
  // const minimumPickup = TTR.getState() === "setup" ? 2 : 1;

  const destinationTicketsInfo = {
    tickets: TTR.getDestinationTickets(),
    minimumPickup: 2,
  };

  return c.json(destinationTicketsInfo);
};

const updatePlayerTickets = async (c: Context) => {
  const { tickets } = await c.req.json();
  const playerID = getCookie(c, "user-ID");
  const game = c.get("game");
  game.addDestinationTicketsTo(playerID, tickets);

  return c.text("ok", 200);
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

const playerRoutes = (): Hono => {
  const player: Hono = new Hono();
  player.use(setPlayerContext);
  player.get("/properties", fetchPlayerHand);
  player.post("/destination-tickets", updatePlayerTickets);
  player.post("/draw-blind-card", drawCardFromDeck);
  player.post("/drawFaceup-card", drawFaceUpCard);

  return player;
};

const gameRoutes = (): Hono => {
  const game: Hono = new Hono();

  game.get("/map", fetchMap);
  game.get("/face-up-cards", fetchFaceUps);
  game.get("/players-detail", fetchPlayerDetails); // /players
  game.get("/destination-tickets", fetchTicketChoices);
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
