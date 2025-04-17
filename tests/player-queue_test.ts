import { assertEquals } from "assert";
import { describe, it } from "jsr:@std/testing/bdd";
import { WaitingQueue } from "../src/models/player-queue.ts";

describe("WaitingQueue", () => {
  it("Should create waiting queue", () => {
    const queue = new WaitingQueue();
    assertEquals(queue.getWaitingQueue(), []);
  });

  it("Should add a player to waiting queue and return true", () => {
    const queue = new WaitingQueue();

    assertEquals(queue.add("Dhanoj"), true);
  });

  it("Should not add a player to waiting queue and return false", () => {
    const queue = new WaitingQueue();
    queue.add("Dhanoj");
    queue.add("sarup");
    queue.add("hari");

    assertEquals(queue.add("Anjali"), false);
  });

  it("Should return true when waiting queue have 3 players", () => {
    const queue = new WaitingQueue();
    queue.add("Dhanoj");
    queue.add("sarup");
    queue.add("hari");
    assertEquals(queue.isFull(), true);
  });

  it("Should return false when waiting queue have less than 3 players", () => {
    const queue = new WaitingQueue();
    queue.add("Dhanoj");
    queue.add("sarup");
    assertEquals(queue.isFull(), false);
  });

  it("Should return true when waiting queue have that player", () => {
    const queue = new WaitingQueue();
    queue.add("Dhanoj");
    assertEquals(queue.isPresent("Dhanoj"), true);
  });

  it("Should return false when waiting queue don't have that player", () => {
    const queue = new WaitingQueue();
    queue.add("Dhanoj");
    assertEquals(queue.isPresent("Sarup"), false);
  });

  it("Should clear the waiting queue", () => {
    const queue = new WaitingQueue();
    queue.add("Dhanoj");
    queue.clear();
    assertEquals(queue.getWaitingQueue(), []);
  });
});
