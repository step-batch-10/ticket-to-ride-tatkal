import { assertEquals } from "assert";
import { describe, it } from "jsr:@std/testing/bdd";
import { Ttr } from "../src/models/ttr.ts";
import { UsMap } from "../src/models/UsMap.ts";

const mockedReader = (_path: string | URL): string => {
  return "usa map";
};

describe("Ttr", () => {
  it("should return map", () => {
    const ttr = new Ttr([""], UsMap.getInstance(mockedReader));

    assertEquals(ttr.getMap(), "usa map");
  });
});
