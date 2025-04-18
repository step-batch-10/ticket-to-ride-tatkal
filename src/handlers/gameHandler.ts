import { Context } from "hono";

export const fetchMap = (context: Context) => {
  const game = context.get("game");

  return context.json({ svg: game.getMap() });
};

export const fetchFaceUps = (context: Context) => {
  const game = context.get("game");
  return context.json(game.getFaceUpCards());
};
