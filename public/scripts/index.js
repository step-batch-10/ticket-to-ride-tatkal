const joinLobby = async () => {
  const res = await fetch("/wait", { method: "POST" });
  globalThis.location = res.url;
};

const main = () => {
  const playBtn = document.querySelector("#play-game-index");
  playBtn.addEventListener("click", joinLobby);
};

globalThis.onload = main;
