import { assertEquals } from "assert";
import { describe, it } from "jsr:@std/testing/bdd";
import { Player } from "../src/models/player.ts";

describe("Player", () => {
  describe("getTrainCars", () => {
    it("should return 45 cars", () => {
      const player = new Player("1");
      assertEquals(player.getTrainCars(), 45);
    });
  });

  describe("getHand", () => {
    it("should return an empty [] when there are no cards", () => {
      const player = new Player("1");
      assertEquals(player.getHand(), []);
    });
  });

  describe("getId", () => {
    it("should return id of the player", () => {
      const player = new Player("1");
      assertEquals(player.getId(), "1");
    });
  });

  describe("addCardsToHand", () => {
    it("should add cards to player hand", () => {
      const player = new Player("1");
      player.addCardsToHand({ color: "red" });
      assertEquals(player.getHand(), [{ color: "red" }]);
    });
  });
});
