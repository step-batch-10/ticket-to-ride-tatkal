import { assertEquals } from "assert";
import { beforeEach, describe, it } from "jsr:@std/testing/bdd";
import { Users } from "../src/models/users.ts";

describe("Users details", () => {
  let users: Users;
  let fd: FormData;

  beforeEach(() => {
    users = new Users();
    fd = new FormData();
    fd.append("username", "Anna");
  });

  it("should add the new user and return the user id, by add method", () => {
    const userID = users.add(fd);
    assertEquals(userID, 1);
  });

  it("should return the user info, by getInfo method", () => {
    users.add(fd);

    const userDetails = users.getInfo("1");

    assertEquals(userDetails.name, "Anna");
  });
});
