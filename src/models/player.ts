import { card } from "./schemas.ts";
import { PlayerInfo } from "../types.ts";

export class Player {
  private id: string;
  private name: string;
  private trainCars: number;
  private hand: card[];
  private destinationTickets: card[];

  constructor(PlayerDetails: PlayerInfo) {
    this.id = PlayerDetails.id;
    this.name = PlayerDetails.name;
    this.trainCars = 45;
    this.hand = [];
    this.destinationTickets = [];
  }

  addCardsToHand(...cards: card[]) {
    this.hand.push(...cards);
  }

  getTrainCars() {
    return this.trainCars;
  }

  getHand() {
    return this.hand;
  }

  getId() {
    return this.id;
  }

  status() {
    return {
      id: this.id,
      trainCars: this.trainCars,
      trainCarCards: this.hand.length,
      tickets: this.destinationTickets.length,
    };
  }
}
