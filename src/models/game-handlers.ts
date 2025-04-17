import { Ttr } from "./ttr.ts";
import { UsMap } from "./UsMap.ts";
import { WaitingQueue } from "./player-queue.ts";
import { type Reader } from "./schemas.ts";

type Game = {
  gameId: number;
  players: string[];
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

  createGame(players: string[], reader: Reader) {
    const gameId: number = this.generateGameId();
    const map = UsMap.getInstance(reader);
    this.games.push({ gameId, players, game: new Ttr(players, map) });

    return gameId;
  }

  getGame(id: number) {
    return this.games.find(({ gameId }) => gameId === id);
  }

  addToQueue(name: string) {
    return this.queue.add(name);
  }

  getWaitingList(player: string) {
    return this.queue.getWaitingQueue(player);
  }

  getGameByPlayer(player: string) {
    const game = this.games.find((game) => game.players.includes(player));

    return game;
  }
}
