export class PlayerQueue {
  waitingQueue: string[];

  constructor() {
    this.waitingQueue = [];
  }

  add(player: string) {
    if (this.waitingQueue.length < 3) {
      this.waitingQueue.push(player);
    }
  }

  getWaitingQueue() {
    return this.waitingQueue;
  }

  clear() {
    this.waitingQueue = [];
  }

  isFull() {
    return this.waitingQueue.length === 3;
  }

  isPresent(player: string) {
    return this.waitingQueue.includes(player);
  }
}
