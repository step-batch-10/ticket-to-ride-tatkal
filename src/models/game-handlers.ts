import { Ttr } from "./ttr.ts";
import { UsMap } from "./UsMap.ts";
import { WaitingQueue } from "./player-queue.ts";
import { type Reader } from "./schemas.ts";

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

  createGame(reader: Reader) {
    const players = this.queue.getWaitingQueue();
    const gameId: string = this.#generateGameId();
    const map = UsMap.getInstance(reader);
    this.games.push({ gameId, game: new Ttr(players, map) });

    return gameId;
  }

  getGame(id: string) {
    return this.games.find(({ gameId }) => gameId === id);
  }
}
