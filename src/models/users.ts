import { user } from "../types.ts";

class Users {
  private nextID;
  private users;

  constructor() {
    this.nextID = 0;
    this.users = new Map();
  }

  add(userDetails: user) {
    this.nextID += 1;

    const userId = String(this.nextID);
    this.users.set(userId, userDetails);

    return userId;
  }

  getInfo(id: String) {
    return this.users.get(id);
  }
}

export { Users };
