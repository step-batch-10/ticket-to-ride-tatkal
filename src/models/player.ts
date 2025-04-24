import {
  card,
  playerHandCard,
  PlayerInfo,
  PlayerResources,
  Tickets,
} from "./schemas.ts";

export class Player {
  private id: string;
  private name: string;
  private trainCars: number;
  private hand: playerHandCard[];
  private destinationTickets: Tickets[];
  private color: string;
  constructor(PlayerDetails: PlayerInfo, color: string) {
    this.id = PlayerDetails.id;
    this.name = PlayerDetails.name;
    this.trainCars = 45;
    this.hand = this.initializeHand();
    this.destinationTickets = [];
    this.color = color;
  }

  private initializeHand() {
    const colors = [
      "red",
      "blue",
      "green",
      "yellow",
      "black",
      "white",
      "orange",
      "pink",
      "locomotive",
    ];
    return colors.map((color) => ({ color, count: 0 }));
  }

  addCardsToHand(...cards: card[]) {
    cards.forEach((card) => {
      const colorCards = this.hand.find(({ color }) => color === card.color);
      colorCards!.count++;
    });
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

  addDestinationTickets(tickets: Tickets[]) {
    return this.destinationTickets.push(...tickets);
  }

  getDestinationTickets() {
    return this.destinationTickets;
  }

  status() {
    return {
      id: this.id,
      name: this.name,
      color: this.color,
      trainCars: this.trainCars,
      trainCarCards: this.hand.reduce((total, card) => card.count + total, 0),
      tickets: this.destinationTickets.length,
    };
  }

  getColor() {
    return this.color;
  }

  getPlayerResources(): PlayerResources {
    return {
      ...this.status(),
      destinationTickets: this.getDestinationTickets(),
      playerHandCards: this.getHand(),
    };
  }
}
