import { PlayerInfo } from "../types.ts";

type list = PlayerInfo[];

export class WaitingQueue {
  waitingQueue: list[];

  constructor() {
    this.waitingQueue = [];
  }

  add(player: PlayerInfo) {
    const last = this.waitingQueue.at(0);

    if (last && last.length < 3) {
      last.push(player);
    } else {
      this.waitingQueue.unshift([player]);
    }

    return true;
  }

  private isPresent(list: PlayerInfo[], player: string) {
    return list.some(({ name }) => name === player);
  }

  getWaitingQueue(player: string) {
    const players = this.waitingQueue.find((list) =>
      this.isPresent(list, player)
    );
    
    return players ? players : [];
  }

  isFull(player: string) {
    const queue = this.waitingQueue.find((list) =>
      this.isPresent(list, player)
    );

    return queue?.length === 3;
  }
}
