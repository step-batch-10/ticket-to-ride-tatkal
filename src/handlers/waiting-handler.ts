import { getCookie, setCookie } from "hono/cookie";
import { Context } from "hono";
import { PlayerInfo } from "../types.ts";

export const addToWaitingQueue = (context: Context) => {
  const userId = getCookie(context, "user-ID");
  const name: string = context.get("users").getInfo(userId).username;
  context.get("gameHandler").addToQueue({ id: userId, name }, 3);

  return context.redirect("/waiting-page.html");
};

export const getQueue = (context: Context) => {
  const userId = getCookie(context, "user-ID"); // set userId in middleWare
  const { players } = context.get("gameHandler").getWaitingList(userId);

  return context.json(players.map((player: PlayerInfo) => player.name));
};

const getGameId = (
  context: Context,
  playerId: string | undefined,
  players: PlayerInfo[],
) => {
  const game = context.get("gameHandler").getGameByPlayer(playerId);
  if (game) {
    return game.gameId;
  }

  const id = context
    .get("gameHandler")
    .createGame(players, context.get("reader"));

  return id;
};

export const redirectToGame = (context: Context) => {
  const userId = getCookie(context, "user-ID");
  const { maxPlayers, players } = context
    .get("gameHandler")
    .getWaitingList(userId);

  if (maxPlayers === players.length) {
    const gameId = getGameId(context, userId, players);
    setCookie(context, "game-ID", gameId);
    return context.redirect("/game.html");
  }

  return context.json({ message: "game not started" });
};
