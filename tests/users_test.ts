import { assertEquals } from "assert";
import { describe, it } from "jsr:@std/testing/bdd";
import { Users } from "../src/models/users.ts";

describe("Users details", () => {
  it("should add the new user and return the user id, by add method", () => {
    const users = new Users();
    const userID = users.add({ username: "Anna" });
    assertEquals(userID, "1");
  });

  it("should return the user info, by getInfo method", () => {
    const users = new Users();

    users.add({ username: "Anna" });
    const userDetails = users.getInfo("1");

    assertEquals(userDetails?.username, "Anna");
  });
});
