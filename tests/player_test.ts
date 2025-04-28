import { assert, assertEquals, assertFalse } from "assert";
import { describe, it } from "jsr:@std/testing/bdd";
import { Player } from "../src/models/player.ts";

describe("Test for Player class", () => {
  describe("when a player instance is created", () => {
    it("should return a list of 45 cars on getTrainCars()", () => {
      const player = new Player({ name: "sushanth", id: "1" }, "red");

      assertEquals(player.getTrainCars(), 45);
    });

    it("should return a list of 9 type of color cards on getHand()", () => {
      const player = new Player({ name: "sushanth", id: "1" }, "red");

      assertEquals(player.getHand().length, 9);
    });

    it("should return the assigned color of the player on getColor()", () => {
      const player = new Player({ name: "sushanth", id: "1" }, "red");

      assertEquals(player.getColor(), "red");
    });

    it("should return the id of player on getId()", () => {
      const player = new Player({ name: "sushanth", id: "1" }, "red");

      assertEquals(player.getId(), "1");
    });

    it("should return the name of player on getName()", () => {
      const player = new Player({ name: "sushanth", id: "1" }, "red");

      assertEquals(player.getName(), "sushanth");
    });
  });

  describe("when a card is added to hand by addCardsToHand", () => {
    it("should add cards to player hand", () => {
      const player = new Player({ name: "sushanth", id: "1" }, "red");
      player.addCardsToHand({ color: "red" });

      const actual = player.getHand().find((c) => c.color === "red");
      assertEquals(actual?.count, 1);
    });
  });

  describe("when player is adds some destination cards", () => {
    it("should return all tickets on getDestinationTickets()", () => {
      const player = new Player({ name: "susahnth", id: "1" }, "red");
      const ticket = [{ id: "t1", from: "c8", to: "c32", points: 21 }];

      player.addDestinationTickets(ticket);
      const actual = player.getDestinationTickets();

      assertEquals(actual.length, 1);
      assertEquals(actual, ticket);
    });
  });

  describe("when player uses train cars", () => {
    it("should deduct those many train cars in player hand", () => {
      const player = new Player({ name: "susahnth", id: "1" }, "red");

      assertEquals(player.deductTrainCars(5), 40);
    });

    it("should deduct the train car cards in player hand", () => {
      const player = new Player({ name: "susahnth", id: "1" }, "red");

      player.addCardsToHand({ color: "red" });
      player.addCardsToHand({ color: "red" });
      player.addCardsToHand({ color: "red" });

      player.deductTrainCarCards([{ color: "red", count: 1 }]);
      const actual = player.getHand().find((c) => c.color === "red");

      assertEquals(actual?.count, 2);
    });
  });

  describe("when player uses train car cards", () => {
    it("should deduct the train car cards in player hand", () => {
      const player = new Player({ name: "susahnth", id: "1" }, "red");

      player.addCardsToHand({ color: "red" });
      player.addCardsToHand({ color: "red" });
      player.addCardsToHand({ color: "red" });

      player.deductTrainCarCards([{ color: "red", count: 1 }]);
      const actual = player.getHand().find((c) => c.color === "red");

      assertEquals(actual?.count, 2);
    });
  });

  describe("when player claims a route", () => {
    it("should add the claimed route to player's data", () => {
      const player = new Player({ name: "susahnth", id: "1" }, "red");
      const route = {
        id: "r1",
        carId: "cr1",
        cityA: "c1",
        cityB: "c2",
        distance: 3,
        color: "gray",
      };

      assertEquals(player.addClaimedRoute(route), 1);
      assertEquals(player.getClaimedRoutes(), [route]);
    });
  });

  describe("Adds a edge in graph", () => {
    it("should add a edge in graph when a route in claimed", () => {
      const player = new Player({ name: "susahnth", id: "1" }, "red");
      const route = {
        id: "r1",
        carId: "cr1",
        cityA: "c1",
        cityB: "c2",
        distance: 3,
        color: "gray",
      };
      player.addEdge(route);
      const graph = player.getGraph();

      assert(graph.hasEdge("c1", "c2"));
      assertFalse(graph.hasEdge("c1", "c3"));
    });
  });
});
