import { assert, assertEquals, assertFalse } from "assert";
import { describe, it } from "jsr:@std/testing/bdd";
import { Users } from "../src/models/users.ts";

describe("Test for Users class", () => {
  describe("when a new user is added", () => {
    it("should add the new user and return the user id", () => {
      const users = new Users();

      const userID = users.add({ username: "Anna" });
      assertEquals(userID, "1");
    });
  });

  describe("when getInfo method is used with a user id of existing user", () => {
    it("should return the user info of that user", () => {
      const users = new Users();

      users.add({ username: "Anna" });
      const actual = users.getInfo("1");

      const expected = { username: "Anna" };
      assertEquals(actual, expected);
    });
  });

  describe("when getInfo method is used with a user id, of non existing user", () => {
    it("should return an empty object", () => {
      const users = new Users();
      users.add({ username: "Anna" });

      const actual = users.getInfo("2");
      assertEquals(actual, {});
    });
  });

  describe("when the user is successfully deleted", () => {
    it("should return true", () => {
      const users = new Users();

      users.add({ username: "Anna" });

      assert(users.delete("1"));
    });
  });

  describe("when the user cannot be deleted(non existent user)", () => {
    it("should return false", () => {
      const users = new Users();

      assertFalse(users.delete("1"));
    });
  });
});
