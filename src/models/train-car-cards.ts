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

  drawCard(): card {
    return this.deck.pop() || { color: "black" };
  }

  private refillFaceUpCards(): void {
    while (this.faceUpCards.length < 5) {
      this.faceUpCards.push(this.drawCard());
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
    this.faceUpCards[index] = this.drawCard();
    return card;
  }
}
