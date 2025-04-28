import { assert, assertEquals } from "assert";
import { describe, it } from "jsr:@std/testing/bdd";
import { USAMap } from "../src/models/USA_map.ts";
import tickets from "../json/tickets.json" with {
  type: "json",
};
import DestinationTickets from "../src/models/tickets.ts";

const mockedReader = (_path: string | URL): string => {
  // deno-lint-ignore no-explicit-any
  const loc: any = _path;

  if (loc.endsWith(".json")) {
    return JSON.stringify(tickets);
  }

  return "usa map";
};

describe("Test for UsMap class", () => {
  describe("fetching the map by getInstance", () => {
    it("should give map data of map file", () => {
      const usaMap = USAMap.getInstance(mockedReader);

      assert(usaMap instanceof USAMap);
      assertEquals(usaMap.getMap(), "usa map");
    });
  });

  describe("when the method getDestinationTickets is called", () => {
    it("should give map data of map file", () => {
      const usaMap = USAMap.getInstance(mockedReader);
      const tickets = usaMap.getDestinationTickets();

      assert(tickets instanceof DestinationTickets);
    });
  });
});
