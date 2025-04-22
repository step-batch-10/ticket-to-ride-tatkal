import { TrainCarCards } from "../src/models/train-car-cards.ts";
import { assert, assertEquals, assertThrows } from "assert";
import { describe, it } from "jsr:@std/testing/bdd";
import { card } from "../src/models/schemas.ts";

describe("trainCarCards", () => {
  describe("getFaceUpCards", () => {
    it("should return 5 faceup cards", () => {
      const cards = new TrainCarCards();
      assertEquals(cards.getFaceUpCards().length, 5);
    });
  });
  describe("getFaceUpCards", () => {
    it("should return 5 faceup cards", () => {
      const cards = new TrainCarCards();
      assertEquals(cards.getFaceUpCards().length, 5);
    });
  });

  describe("getDeck", () => {
    it("should return 105 cards after taking face ups", () => {
      const cards = new TrainCarCards();
      assertEquals(cards.getDeck().length, 105);
    });
  });
  describe("drawCard", () => {
    it("should return drawn card and deck length should reduce", () => {
      const cards = new TrainCarCards();
      const topCard = cards.getDeck().at(-1);
      assertEquals(cards.drawCard(), topCard);
      assertEquals(cards.getDeck().length, 104);
    });

    it("should return drawn card even deck is empty", () => {
      // deno-lint-ignore no-explicit-any
      const cards: any = new TrainCarCards();
      cards.deck = [];

      assertEquals(cards.drawCard(), { color: "black" });
    });
  });

  describe("drawFaceUp", () => {
    it("should return drawn face up card and faceUp deck length should be 5(refilled)", () => {
      const cards = new TrainCarCards();
      const firstFaceUp = cards.getFaceUpCards()[0];
      assertEquals(cards.drawFaceUp(0), firstFaceUp);
      assertEquals(cards.getFaceUpCards().length, 5);
    });
    it("should throw error when index is greater than 5", () => {
      const cards = new TrainCarCards();
      assertThrows(() => {
        cards.drawFaceUp(6);
      });
    });

    it("should get face up cards with less than 3 locomotive", () => {
      // deno-lint-ignore no-explicit-any
      const cards: any = new TrainCarCards();
      cards.faceUpCards = [
        { color: "locomotive" },
        { color: "locomotive" },
        { color: "locomotive" },
        { color: "locomotive" },
        { color: "red" },
      ];

      cards.drawFaceUp(4);
      const locoCount = cards.faceUpCards.filter(
        (card: card) => card.color === "locomotive",
      ).length;

      assert(locoCount < 3);
    });
  });

  describe("discard", () => {
    it("should return true when discarded", () => {
      const cards = new TrainCarCards();
      assertEquals(cards.discard([{ color: "pink" }]), 1);
    });
  });
});
