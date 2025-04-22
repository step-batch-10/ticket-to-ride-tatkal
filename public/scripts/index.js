const joinLobby = async () => {
  const res = await fetch("/wait", { method: "POST" });
  globalThis.location = res.url;
};

const logOut = async () => {
  const res = await fetch("/logout", { method: "DELETE" });
  globalThis.location = res.url;
};

const main = () => {
  const playBtn = document.querySelector("#play-game-index");
  playBtn.addEventListener("click", joinLobby);

  const logOutBtn = document.querySelector("#logoutButton");
  logOutBtn.addEventListener("click", logOut);
};

globalThis.onload = main;
