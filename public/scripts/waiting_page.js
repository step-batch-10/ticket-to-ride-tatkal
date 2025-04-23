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

const fetchPlayers = async () => {
  const res = await fetch("/waiting-list");
  const player = await res.json();

  return player;
};

const waitAndRedirect = (url, messageContainer, counter) => {
  const intervalId = setInterval(
    (messageContainer) => {
      messageContainer.innerText = `Game will start in ${counter--} second(s)`;
      if (counter < 0) {
        clearInterval(intervalId);
        globalThis.location.href = url;
      }
    },
    1000,
    messageContainer,
  );
};

const redirectToGame = async (intervalId) => {
  const res = await fetch("/redirectToGame");

  if (res.redirected) {
    clearInterval(intervalId);
    const message = document.querySelector("#msg");
    waitAndRedirect(res.url, message, 3);
  }
};

const main = () => {
  const totalPlayers = 3;
  const id = setInterval(async () => {
    const players = await fetchPlayers();
    createStatus(totalPlayers, players.length);
    createList(players);
    await redirectToGame(id);
  }, 2000);
};

globalThis.onload = main;
