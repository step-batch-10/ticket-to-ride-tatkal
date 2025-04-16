import { Context } from "hono";
import { Ttr } from "./ttr.ts";
import { UsMap } from "./UsMap.ts";
export class GameHandler {
  fetchMap(context: Context) {
    const game = new Ttr(new UsMap(context.get("reader")));
    return context.json({ svg: game.getMap() });
  }
}
