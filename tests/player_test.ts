import { assertEquals } from "assert";
import { describe, it } from "jsr:@std/testing/bdd";
import { Player } from "../src/models/player.ts";
import tickets from "../json/tickets.json" with { type: "json" };

describe("Player", () => {
  describe("getTrainCars", () => {
    it("should return 45 cars", () => {
      const player = new Player({ name: "susahnth", id: "1" }, "red");
      assertEquals(player.getTrainCars(), 45);
    });
  });

  describe("getHand", () => {
    it("should return array of 9 cards colors", () => {
      const player = new Player({ name: "susahnth", id: "1" }, "red");
      assertEquals(player.getHand().length, 9);
    });
  });

  describe("getColor", () => {
    it("should return red", () => {
      const player = new Player({ name: "susahnth", id: "1" }, "red");
      assertEquals(player.getColor(), "red");
    });
  });

  describe("getId", () => {
    it("should return id of the player", () => {
      const player = new Player({ name: "susahnth", id: "1" }, "red");
      assertEquals(player.getId(), "1");
    });
  });

  describe("addCardsToHand", () => {
    it("should add cards to player hand", () => {
      const player = new Player({ name: "susahnth", id: "1" }, "red");
      player.addCardsToHand({ color: "red" });
      assertEquals(player.getHand().length, 9);
    });
  });

  describe("get destination cards of player", () => {
    it("should return all dt cards to player hand", () => {
      const player = new Player({ name: "susahnth", id: "1" }, "red");
      player.addDestinationTickets(tickets);
      assertEquals(player.getDestinationTickets(), tickets);
    });
  });
});
