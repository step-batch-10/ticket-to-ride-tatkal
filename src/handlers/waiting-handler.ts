import { getCookie, setCookie } from "hono/cookie";
import { Context } from "hono";
import { PlayerInfo } from "../types.ts";

export const addToWaitingQueue = (context: Context) => {
  const userId = getCookie(context, "user-ID");
  const name: string = context.get("users").getInfo(userId).username;

  context.get("gameHandler").addToQueue({ id: userId, name });

  return context.redirect("/waiting-page.html");
};

export const getQueue = (context: Context) => {
  const userId = getCookie(context, "user-ID");

  return context.json(context.get("gameHandler").getWaitingList(userId));
};

const getGameId = (context: Context, player: string, players: PlayerInfo[]) => {
  const game = context.get("gameHandler").getGameByPlayer(player);
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
  const name: string = context.get("users").getInfo(userId).username;
  const waitingList = context.get("gameHandler").getPlayersInfo(userId);

  if (waitingList.length === 3) {
    const gameId = getGameId(context, name, waitingList);
    setCookie(context, "game-ID", gameId);
    return context.redirect("/game.html");
  }

  return context.redirect("/waiting-page.html");
};
