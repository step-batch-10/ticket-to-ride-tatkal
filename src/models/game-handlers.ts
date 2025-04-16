import { WaitingQueue } from "./player-queue.ts";
import { Ttr } from "./ttr.ts";

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

  createGame() {
    const players = this.queue.getWaitingQueue();
    const gameId: string = this.#generateGameId();
    this.games.push({ gameId, game: new Ttr(players) });

    return gameId;
  }
}
