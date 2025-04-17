import { assertEquals } from "assert";
import { describe, it } from "jsr:@std/testing/bdd";
import { Ttr } from "../src/models/ttr.ts";
import { UsMap } from "../src/models/UsMap.ts";

const mockedReader = (_path: string | URL): string => {
  return "usa map";
};

describe("Ttr", () => {
  describe("getMap", () => {
    it("should return map", () => {
      const ttr = new Ttr([""], UsMap.getInstance(mockedReader));
      assertEquals(ttr.getMap(), "usa map");
    });
  });

  describe("getFaceUpCards", () => {
    it("should return an array of length 5 faceup cards", () => {
      const ttr = new Ttr([""], UsMap.getInstance(mockedReader));
      assertEquals(ttr.getFaceUpCards().length, 5);
    });
  });
});
