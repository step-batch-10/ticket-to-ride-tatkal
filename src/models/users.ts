class Users {
  private nextID;
  private users;

  constructor() {
    this.nextID = 0;
    this.users = new Map();
  }

  add(fd: FormData) {
    this.nextID += 1;
    const name = fd.get("username");
    this.users.set(String(this.nextID), { name });

    return this.nextID;
  }

  getInfo(id: String) {
    return this.users.get(id);
  }
}

export { Users };
