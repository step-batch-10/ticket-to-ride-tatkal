import { ClaimRoute } from "./claim_route.js";
import { DrawTCC } from "./draw_TCC.js";
import { DestinationTickets, fetchJSON } from "./draw_tickets.js";

export const continueGame = async () => {
  await fetch("/game/player/done", { method: "PATCH" });
};

export const showAction = (msg, state = "success") => {
  const toastLive = document.getElementById("liveToast");

  toastLive.classList.remove(`bg-danger`);
  toastLive.classList.add(`bg-${state}`);
  toastLive.querySelector(".toast-body").innerText = msg;
  const toast = new bootstrap.Toast(toastLive, { delay: 3000 });

  toast.show();
};

const displayTickets = (tags) => {
  const selectorTemplate = cloneTemplate("#ticket-selector-template");
  const container = selectorTemplate.querySelector("#ticket-container");
  const ticketDisplay = document.querySelector(".ticket-display");

  container.append(...tags);
  ticketDisplay.classList.add("align-right");
  ticketDisplay.replaceChildren(selectorTemplate);
};

const createDiv = (classNames = []) => {
  const div = document.createElement("div");
  classNames.forEach((cls) => div.classList.add(cls));
  return div;
};

const createTrainCarCard = ({ color }) => {
  const card = createDiv(["train-car-card", color]);
  const img = document.createElement("img");
  img.className = "img";
  img.src = "/assets/image.png";

  card.appendChild(img);

  return card;
};
export const createTicketCard = ({ fromCity, toCity, points, id }) => {
  const ticketCard = createDiv(["player-ticket-card"]);
  ticketCard.innerText =
    `from: ${fromCity} → to: ${toCity} → points: ${points}`;
  ticketCard.dataset.ticketId = id;
  return ticketCard;
};

const createFaceUpCard = (TCCardManager) => (card, index) => {
  const faceUpCard = createTrainCarCard(card);
  faceUpCard.classList.add("action");
  faceUpCard.addEventListener(
    "dblclick",
    () => TCCardManager.drawFaceUpCard(index, card.color),
  );
  return faceUpCard;
};

const getDrawTCCInstance = (() => {
  const instance = new DrawTCC();
  return () => instance;
})();

const getClaimRouteInstance = (() => {
  const instance = new ClaimRoute();
  return () => instance;
})();

const storeColor = (e) => {
  const color = e.currentTarget.classList[1];

  getClaimRouteInstance().assignCardColor(color);
};

const createPlayerHandCard = ({ color, count }) => {
  const handCard = createTrainCarCard({ color });
  handCard.classList.add("hand-card");

  const countElem = document.createElement("p");
  countElem.classList.add("card-count");
  countElem.innerText = count;
  handCard.appendChild(countElem);
  handCard.addEventListener("click", storeColor);

  return handCard;
};

const insertText = (parent, selector, text) => {
  parent.querySelector(selector).innerText = text;
};

const cloneTemplate = (id) =>
  document.querySelector(id).content.cloneNode(true);

const renderChildren = (selector, elements) => {
  document.querySelector(selector).replaceChildren(...elements);
};

const renderMap = ({ svg }) => {
  document.querySelector("#mapContainer").innerHTML = svg;
};

const renderFaceupCards = (TCCardManager, cards) => {
  const elements = cards.map(createFaceUpCard(TCCardManager));
  renderChildren("#face-up-container", elements);
};

const renderPlayerResources = ({
  trainCars,
  playerHandCards,
  destinationTickets,
  color,
}) => {
  const cars = document.querySelector("#cars");
  cars.innerText = trainCars;
  cars.classList.add(color);
  const cards = playerHandCards
    .filter(({ count }) => count > 0)
    .map(createPlayerHandCard);
  const tickets = destinationTickets.map(createTicketCard);
  renderChildren("#player-hand", cards);
  renderChildren("#player-ticket-cards", tickets);
};

const renderPlayerCards = (players, currentPlayerID) => {
  const container = document.getElementById("players-container");
  container.replaceChildren();

  players.forEach(({ id, name, trainCars, trainCarCards, tickets, color }) => {
    const card = cloneTemplate("#player-card");
    card.querySelector(".player-badge").classList.add(color);

    insertText(card, ".player-name", name);
    insertText(card, ".cars", `cars: ${trainCars}`);
    insertText(card, ".train-car-cards", `train-cards: ${trainCarCards}`);
    insertText(card, ".destination-cards", `tickets: ${tickets}`);

    if (id === currentPlayerID) {
      card.querySelector(".player-card").classList.add("highlight");
    }

    container.append(card);
  });
};

const renderLogs = (logs) => {
  const logContainer = document.querySelector("#logs");
  const logMessages = logs.map((log) => {
    const pTag = document.createElement("p");
    pTag.innerText =
      `> ${log.playerName} drawn ${log.assets} card(s) from ${log.from}`;
    return pTag;
  });
  logContainer.replaceChildren(...logMessages);
};

const renderClaimedRoute = (claimedRoutes) => {
  claimedRoutes.forEach((r) => {
    const car = document.querySelector(`#${r.carId}`);
    const paths = car.querySelectorAll("path");
    car.style.display = "inline";

    paths.forEach((p) => {
      p.style.fill = r.playerColor;
    });
  });
};

const unBlockCurrentPlayer = (isCurrentPlayer) => {
  const actions = document.querySelectorAll(".action");
  actions.forEach((el) => el.classList.toggle("disable", !isCurrentPlayer));
};

const gameState = (initialState) => {
  let state = initialState;
  return (currentGameState) => {
    if (state !== currentGameState) {
      showAction(`Game state changed to "${currentGameState}"`);
      state = currentGameState;
    }
  };
};

const announceGameStateChange = gameState("setup");

const masterRender = ({
  faceUpCards,
  playerResources,
  players,
  isActive,
  currentPlayerID,
  logs,
  claimedRoutes,
  state,
}) => {
  renderFaceupCards(getDrawTCCInstance(), faceUpCards);
  renderPlayerResources(playerResources);
  renderPlayerCards(players, currentPlayerID);
  unBlockCurrentPlayer(isActive);
  renderLogs(logs);
  renderClaimedRoute(claimedRoutes);
  announceGameStateChange(state);
};

const highlightTicket = (ticket) => ticket.classList.toggle("selected");

const handleTicketSelection = (ticket, ticketManager) => () => {
  highlightTicket(ticket);
  ticketManager.toggleSelection(ticket.dataset.ticketId);
};

const confirmTickets = (ticket, ticketManager) => async () => {
  const confirmed = await ticketManager.confirmTickets(ticket.dataset.ticketId);
  if (!confirmed) return;
  continueGame();

  const ticketArea = document.querySelector(".ticket-display");
  ticketArea.classList.remove("align-right");
  document.querySelector("#ticket-selection")?.remove();
};

const drawDestinationCards = async (ticketManager) => {
  //changes this inconsistent method!
  const tickets = await ticketManager.getTopThree();
  if (!tickets) return;

  const ticketTags = tickets.map(createTicketCard);

  ticketTags.forEach((tag) => {
    tag.tabIndex = 0;
    tag.addEventListener("click", handleTicketSelection(tag, ticketManager));
    tag.addEventListener("dblclick", confirmTickets(tag, ticketManager));
  });

  displayTickets(ticketTags);
};

const drawBlindCard = () => {
  document
    .getElementById("blind-cards")
    .addEventListener("dblclick", () => getDrawTCCInstance().drawBlindCard());
};

const sendRequestToClaim = (e) => {
  const routeId = e.currentTarget.id;

  getClaimRouteInstance().claimRoute(routeId);
};

const claimRoute = () => {
  const routes = document.querySelectorAll(".routes");

  routes.forEach((route) => {
    route.addEventListener("dblclick", sendRequestToClaim);
  });
};

const renderPage = () => {
  setInterval(async () => {
    masterRender(await fetchJSON("/game/player/status"));
  }, 1000);
};

const main = async () => {
  const ticketManager = new DestinationTickets();
  document
    .querySelector("#destination-tickets")
    .addEventListener("click", () => drawDestinationCards(ticketManager));

  const { state } = await fetchJSON("/game/player/status");
  if (state === "setup") {
    // server is rejecting the request bcz of not curr player, need to handle
    drawDestinationCards(new DestinationTickets());
  }

  renderMap(await fetchJSON("/game/map"));
  drawBlindCard();
  claimRoute();
  renderPage();
};

globalThis.onload = main;
