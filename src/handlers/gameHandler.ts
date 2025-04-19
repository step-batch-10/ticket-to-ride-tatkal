import { Context } from "hono";
import { getCookie } from "hono/cookie";
import { Player } from "../models/player.ts";

export const fetchMap = (context: Context) => {
  const game = context.get("game");

  return context.json({ svg: game.getMap() });
};

export const fetchFaceUps = (context: Context) => {
  const game = context.get("game");
  return context.json(game.getFaceUpCards());
};

export const fetchPlayerHand = (context: Context) => {
  const game = context.get("game");
  const playerId = getCookie(context, "user-ID");

  const currentPlayer = game.getPlayers().find((player: Player) => {
    return player.getId() == playerId;
  });

  if (!currentPlayer) {
    return context.json({ message: "player not found" }, 404);
  }
  const properties = {
    hand: currentPlayer.getHand(),
    cars: currentPlayer.getTrainCars(),
  };
  return context.json(properties);
};

export const fetchPlayerDetails = (context: Context) => {
  const game = context.get("game");
  const players = game.getPlayerDetails();

  return context.json(players);
};
