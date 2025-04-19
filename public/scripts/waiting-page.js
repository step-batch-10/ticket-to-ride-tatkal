const createList = (players) => {
  const list = document.getElementById("waiting-list");
  list.textContent = "";
  players.forEach((player, index) => {
    const listItem = document.createElement("li");
    const role = document.createElement("span");

    listItem.setAttribute("class", "list-group-item");

    listItem.textContent = player;

    if (index === 0) {
      role.setAttribute("class", "badge bg-warning rounded-pill");
      role.textContent = "Host";
      listItem.appendChild(role);
    }
    list.append(listItem);
  });
};

const createStatus = (totalPlayers, playerCount) => {
  const status = document.getElementById("status");
  status.textContent = "";
  const div = document.createElement("div");
  div.textContent = `${playerCount}/${totalPlayers} Joined`;
  status.appendChild(div);
};

const fetchplayers = async () => {
  const res = await fetch("/waiting-list");
  const player = await res.json();

  return player;
};

const redirectToGame = async () => {
  const res = await fetch("/redirectToGame");
  const url = new URL(res.url);

  if (url.pathname === "/game.html") {
    globalThis.location.href = res.url;
  }
};

const main = () => {
  const totalPlayers = 3;
  setInterval(async () => {
    const players = await fetchplayers();
    createStatus(totalPlayers, players.length);
    createList(players);
    await redirectToGame();
  }, 1000);
};

globalThis.onload = main;
