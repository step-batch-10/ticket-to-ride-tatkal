import { Context } from "hono";

export const fetchMap = (context: Context) => {
  const game = context.get("game");
  console.log(game);
  
  return context.json({ svg: game.getMap() });
};