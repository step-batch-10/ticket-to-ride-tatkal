import { card } from "./schemas.ts";
import _ from "lodash";

export class TrainCarCards {
  private deck: card[];
  private discardPile: card[];
  private faceUpCards: card[];
  private colors: string[];

  constructor() {
    this.deck = [];
    this.discardPile = [];
    this.faceUpCards = [];
    this.colors = [
      "red",
      "blue",
      "green",
      "yellow",
      "black",
      "white",
      "orange",
      "pink",
    ];

    this.initializeDeck();
    this.shuffle();
    this.refillFaceUpCards();
    this.validateAndRefillFaceUp();
  }

  getFaceUpCards(): card[] {
    return this.faceUpCards;
  }

  getDeck() {
    return this.deck;
  }

  private shuffle(): void {
    this.deck = _.shuffle(this.deck);
  }

  private initializeDeck(): void {
    const colorCards: card[] = this.colors.flatMap((color) => {
      return new Array(12).fill({ color });
    });

    const locomotiveCards: card[] = new Array(14).fill({
      color: "locomotive",
    });
    this.deck = [];
    this.deck.push(...colorCards, ...locomotiveCards);
  }

  drawCard(): card | undefined {
    if (this.deck.length === 0) {
      this.deck = _.shuffle(this.discardPile);
      this.discardPile = [];
    }
    return this.deck.pop();
  }

  private refillFaceUpCards(): void {
    while (this.faceUpCards.length < 5) {
      this.faceUpCards.push(this.drawCard()!);
    }
  }

  discard(cards: card[]): number {
    return this.discardPile.push(...cards);
  }

  drawFaceUp(index: number): card | never {
    if (index < 0 || index >= this.faceUpCards.length) {
      throw new Error("Invalid index for face-up cards.");
    }

    const card = this.faceUpCards[index];
    this.faceUpCards[index] = this.drawCard()!;
    this.validateAndRefillFaceUp();

    return card;
  }

  private validateAndRefillFaceUp(): void {
    const colors = this.faceUpCards.map(({ color }) => color);
    const locoCount = _.countBy(colors).locomotive;
    if (locoCount > 2) {
      this.discard(this.faceUpCards);
      this.faceUpCards = [];
      this.refillFaceUpCards();
      this.validateAndRefillFaceUp();
    }
  }
}
