import { Context } from "hono";
import { Ttr } from "./ttr.ts";
import { UsMap } from "./UsMap.ts";
import { WaitingQueue } from "./player-queue.ts";

type Game = {
  gameId: string;
  game: Ttr;
};

export class GameHandler {
  queue: WaitingQueue;
  games: Game[];

  constructor() {
    this.queue = new WaitingQueue();
    this.games = [];
  }

  #generateGameId() {
    return crypto.randomUUID();
  }

  createGame(context: Context) {
    const players = this.queue.getWaitingQueue();
    const gameId: string = this.#generateGameId();
    const map = new UsMap(context.get("reader"));
    this.games.push({ gameId, game: new Ttr(players, map) });

    return gameId;
  }

  getGame(id: string) {
    return this.games.find(({ gameId }) => gameId === id);
  }

  // fetchMap() {
  // const game = new Ttr(new UsMap(context.get("reader")));
  // return context.json({ svg: game.getMap() });
  // }
}
