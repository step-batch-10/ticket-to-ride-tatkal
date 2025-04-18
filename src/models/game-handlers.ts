import { Ttr } from "./ttr.ts";
import { UsMap } from "./UsMap.ts";
import { WaitingQueue } from "./player-queue.ts";
import { type Reader } from "./schemas.ts";
import { PlayerInfo } from "../types.ts";

type Game = {
  gameId: number;
  players: PlayerInfo[];
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

  createGame(players: PlayerInfo[], reader: Reader) {
    const gameId: number = this.generateGameId();
    const map = UsMap.getInstance(reader);
    this.games.unshift({ gameId, players, game: Ttr.createTtr(players, map) });

    return gameId;
  }

  getGame(id: number) {
    return this.games.find(({ gameId }) => gameId === id);
  }

  addToQueue(name: PlayerInfo) {
    return this.queue.add(name);
  }

  getWaitingList(player: string) {
    const players = this.queue.getWaitingQueue(player);

    return players.map(({ name }) => name);
  }

  getPlayersInfo(playerId: string) {
    return this.queue.getWaitingQueue(playerId);
  }

  private isPresent(players: PlayerInfo[], playerName: string) {
    return players.some(({ name }) => name === playerName);
  }

  getGameByPlayer(player: string) {
    const game = this.games.find((game) =>
      this.isPresent(game.players, player)
    );

    return game;
  }
}
