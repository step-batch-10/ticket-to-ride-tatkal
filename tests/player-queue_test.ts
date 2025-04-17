import { assertEquals } from "assert";
import { describe, it } from "jsr:@std/testing/bdd";
import { WaitingQueue } from "../src/models/player-queue.ts";

describe("WaitingQueue", () => {
  it("Should add a player to waiting queue and return true", () => {
    const queue = new WaitingQueue();

    assertEquals(queue.add("Dhanoj"), true);
  });

  it("Should return only one person when the 4th person added", () => {
    const queue = new WaitingQueue();
    queue.add("Dhanoj");
    queue.add("sarup");
    queue.add("hari");
    queue.add("Anjali");

    assertEquals(queue.getWaitingQueue("Anjali"), ["Anjali"]);
  });

  it("Should return true when waiting queue have 3 players", () => {
    const queue = new WaitingQueue();
    queue.add("Dhanoj");
    queue.add("sarup");
    queue.add("hari");
    assertEquals(queue.isFull("Dhanoj"), true);
  });

  it("Should return false when waiting queue have less than 3 players", () => {
    const queue = new WaitingQueue();
    queue.add("Dhanoj");
    queue.add("sarup");

    assertEquals(queue.isFull("sarup"), false);
  });
});
