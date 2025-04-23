import { Ttr } from "./ttr.ts";
import { UsMap } from "./USA_map.ts";
import { WaitingQueue } from "./waiting_queue.ts";
import { Game, PlayerInfo, Reader } from "./schemas.ts";

export class GameManager {
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
    const map = UsMap.getInstance(reader); // change Usmp to USAMap
    this.games.unshift({ gameId, players, game: Ttr.createTtr(players, map) });

    return gameId;
  }

  getGame(id: number) {
    return this.games.find(({ gameId }) => gameId === id);
  }

  addToQueue(player: PlayerInfo, maxPlayers: number) {
    return this.queue.add(player, maxPlayers);
  }

  getWaitingList(playerId: string) {
    return this.queue.getWaitingQueue(playerId);
  }

  // getPlayersInfo(playerId: string) {
  //   return this.queue.getWaitingQueue(playerId);
  // }

  private isPresent(players: PlayerInfo[], playerId: string) {
    return players.some(({ id }) => id === playerId);
  }

  getGameByPlayer(playerId: string) {
    const game = this.games.find((game) =>
      this.isPresent(game.players, playerId)
    );

    return game;
  }
}
