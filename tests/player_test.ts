import { assertEquals } from "assert";
import { describe, it } from "jsr:@std/testing/bdd";
import { Player } from "../src/models/player.ts";
import tickets from "../json/tickets.json" with { type: "json" };

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

describe("getName", () => {
  it("should return red", () => {
    const player = new Player({ name: "sushanth", id: "1" }, "red");
    assertEquals(player.getName(), "sushanth");
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

describe("deduct trainCars", () => {
  it("should return deducted number of trainCars", () => {
    const player = new Player({ name: "susahnth", id: "1" }, "red");

    assertEquals(player.deductTrainCars(5), 40);
  });

  it("should return deducted number of trainCars", () => {
    const player = new Player({ name: "susahnth", id: "1" }, "red");

    assertEquals(player.deductTrainCars(10), 35);
  });
});

describe("deduct trainCarCards", () => {
  it("should return deducted TrainCarCards", () => {
    const player = new Player({ name: "susahnth", id: "1" }, "red");

    assertEquals(player.deductTrainCarCards([{ color: "red", count: 1 }]), [{
      color: "red",
    }]);
  });
});

describe("addClaimedRoute", () => {
  it("should add a route", () => {
    const player = new Player({ name: "susahnth", id: "1" }, "red");
    const route = {
      "id": "r1",
      "carId": "cr1",
      "cityA": "c1",
      "cityB": "c2",
      "distance": 3,
      "color": "gray",
    };
    assertEquals(player.addClaimedRoute(route), 1);
    assertEquals(player.getClaimedRoutes(), [route]);
  });
});
