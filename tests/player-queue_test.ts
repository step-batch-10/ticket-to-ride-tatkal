import { assertEquals } from "assert";
import { describe, it } from "jsr:@std/testing/bdd";
import { WaitingQueue } from "../src/models/player-queue.ts";

describe("WaitingQueue", () => {
  it("Should add a player to waiting queue and return true", () => {
    const queue = new WaitingQueue();

    assertEquals(queue.add({name:"Dhanoj",id:'1'}), true);
  });

  it("Should return only one person when the 4th person added", () => {
    const queue = new WaitingQueue();
    queue.add({name:'sushanth', id:'1'});
    queue.add({name:'sarup', id:'2'});
    queue.add({name:'hari', id:'3'});
    queue.add({name:'Anjali', id:'4'});

    assertEquals(queue.getWaitingQueue("Anjali"), [{ name: 'Anjali', id:"4" }]);
  });

  it("Should return true when waiting queue have 3 players", () => {
    const queue = new WaitingQueue();
    queue.add({name:'sushanth', id:'1'});
    queue.add({name:'sarup', id:'2'});
    queue.add({name:'hari', id:'3'});
    assertEquals(queue.isFull("sushanth"), true);
  });

  it("Should return false when waiting queue have less than 3 players", () => {
    const queue = new WaitingQueue();
    queue.add({name:'sushanth', id:'1'});
    queue.add({name:'sarup', id:'2'});

    assertEquals(queue.isFull("sarup"), false);
  });
});
