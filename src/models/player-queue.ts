import { PlayerInfo } from "../types.ts";

type WaitingList = {
  maxPlayers: number;
  players: PlayerInfo[];
};

export class WaitingQueue {
  waitingQueue: WaitingList[];

  constructor() {
    this.waitingQueue = [];
  }

  add(player: PlayerInfo, maxPlayers: number) {
    const currentWaitingList = this.waitingQueue.find(
      (waitingList) => waitingList.maxPlayers === maxPlayers,
    );

    const players = currentWaitingList?.players;

    if (players && players.length < maxPlayers) {
      players.push(player);
    } else {
      this.waitingQueue.unshift({ players: [player], maxPlayers });
    }

    return true;
  }

  private isPresent(waitingList: WaitingList, playerId: string) {
    return waitingList.players.some(({ id }) => id === playerId);
  }

  getWaitingQueue(playerId: string) {
    const waitingList = this.waitingQueue.find((list) =>
      this.isPresent(list, playerId)
    );

    return waitingList ? waitingList : { players: [] };
  }

  isFull(playerId: string) {
    const queue = this.waitingQueue.find((list) =>
      this.isPresent(list, playerId)
    );

    return queue?.players?.length === 3;
  }
}
