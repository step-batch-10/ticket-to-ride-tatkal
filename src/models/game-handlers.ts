import { Ttr } from "./ttr.ts";
import { UsMap } from "./UsMap.ts";
import { WaitingQueue } from "./player-queue.ts";
import { type Reader } from "./schemas.ts";

type Game = {
  gameId: number;
  game: Ttr;
};

export class GameHandler {
  private nextId: number;
  private queue: WaitingQueue;
  private games: Game[];

  constructor() {
    this.nextId = 1;
    this.queue = new WaitingQueue();
    this.games = [];
  }

  private generateGameId() {
    return this.nextId++;
  }

  createGame(reader: Reader) {
    const players = this.queue.getWaitingQueue();
    const gameId: number = this.generateGameId();
    const map = UsMap.getInstance(reader);
    this.games.push({ gameId, game: new Ttr(players, map) });

    return gameId;
  }

  getGame(id: number) {
    return this.games.find(({ gameId }) => gameId === id);
  }

  addToQueue(name: string) {
    return this.queue.add(name);
  }

  getWaitingList() {
    return this.queue.getWaitingQueue();
  }
}
