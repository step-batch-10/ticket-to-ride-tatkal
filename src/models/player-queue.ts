type list = string[];

export class WaitingQueue {
  waitingQueue: list[];

  constructor() {
    this.waitingQueue = [];
  }

  add(player: string) {
    const last = this.waitingQueue.at(0);

    if (last && last.length < 3) {
      last.push(player);
    } else {
      this.waitingQueue.unshift([player]);
    }

    return true;
  }

  getWaitingQueue(player: string) {
    const players = this.waitingQueue.find((list) => list.includes(player));

    return players ? players : [];
  }

  isFull(player: string) {
    const queue = this.waitingQueue.find((list) => list.includes(player));

    return queue?.length === 3;
  }
}
