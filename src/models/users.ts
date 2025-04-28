import { User } from "./schemas.ts";

class Users {
  private nextID: number;
  private users: Map<string, User>;

  constructor() {
    this.nextID = 0;
    this.users = new Map();
  }

  add(user: User) {
    this.nextID += 1;
    const userId = String(this.nextID);
    this.users.set(userId, user);

    return userId;
  }

  getInfo(id: string) {
    return this.users.get(id) || {};
  }
  delete(id: string) {
    return this.users.delete(id);
  }
}

export { Users };
