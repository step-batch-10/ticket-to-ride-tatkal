import { assert, assertEquals, assertFalse } from "assert";
import { describe, it } from "jsr:@std/testing/bdd";
import { WaitingQueue } from "../src/models/waiting_queue.ts";

describe("Test for WaitingQueue class", () => {
  describe("when a new player is added to queue", () => {
    it("should add the player to waiting queue and return true", () => {
      const queue = new WaitingQueue();

      assertEquals(queue.add({ name: "Dhanoj", id: "1" }, 3), true);
    });
  });

  describe("when less than max players are added", () => {
    it("should return only those players and queue is not full", () => {
      const players = [
        { name: "sushanth", id: "1" },
        { name: "sarup", id: "2" },
      ];

      const queue = new WaitingQueue();
      queue.add(players[0], 3);
      queue.add(players[1], 3);

      assertEquals(queue.getWaitingQueue("2"), { maxPlayers: 3, players });
      assertFalse(queue.isFull("2"));
    });
  });

  describe("when max no of players are added", () => {
    it("should return queue of the total players and queue is full", () => {
      const players = [
        { name: "sushanth", id: "1" },
        { name: "sarup", id: "2" },
        { name: "sam", id: "3" },
      ];

      const queue = new WaitingQueue();
      queue.add(players[0], 3);
      queue.add(players[1], 3);
      queue.add(players[2], 3);

      assertEquals(queue.getWaitingQueue("3"), { maxPlayers: 3, players });
      assert(queue.isFull("3"));
    });
  });

  describe("when more than max players are added", () => {
    it("should return queue with only extra players", () => {
      const players = [
        { name: "sushanth", id: "1" },
        { name: "sarup", id: "2" },
        { name: "sam", id: "3" },
      ];

      const queue = new WaitingQueue();
      queue.add(players[0], 2);
      queue.add(players[1], 2);
      queue.add(players[2], 2);

      assertEquals(queue.getWaitingQueue("3"), {
        maxPlayers: 2,
        players: [{ name: "sam", id: "3" }],
      });
    });
  });
});
