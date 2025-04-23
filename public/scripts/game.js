// ================== Imports ======================
import { DestinationTickets, fetchJSON } from "./draw-tickets.js";

const ContinueGame = async () => {
  await fetch("/game/player/done", { method: "PATCH" });
  poll();
};

// ----- Ticket Generation ------------

const displayTickets = (tags) => {
  const selectorTemplate = cloneTemplate("#ticket-selector-template");
  const container = selectorTemplate.querySelector("#ticket-container");
  const ticketDisplay = document.querySelector(".ticket-display");

  container.append(...tags);
  ticketDisplay.classList.add("align-right");
  ticketDisplay.replaceChildren(selectorTemplate);
};
import { DrawTCC } from "./draw-TCC.js";

// ================== Card Creation ==================
const createDiv = (classNames = []) => {
  const div = document.createElement("div");
  classNames.forEach((cls) => div.classList.add(cls));
  return div;
};

export const createTrainCarCard = ({ color }) => {
  const card = createDiv(["train-car-card", color]);
  const img = document.createElement("img");
  img.className = "img";
  img.src = "/assests/image.png";

  card.appendChild(img);

  return card;
};
export const createTicketCard = ({ from, to, points, id }) => {
  const ticketCard = createDiv(["player-ticket-card"]);
  ticketCard.innerText = `from: ${from} → to: ${to} → points: ${points}`;
  ticketCard.dataset.ticketId = id;
  return ticketCard;
};

export const createFaceUpCard = (TCCardManager) => (card, index) => {
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

export const createPlayerHandCard = ({ color, count }) => {
  const handCard = createTrainCarCard({ color });
  handCard.classList.add("hand-card");

  const countElem = document.createElement("p");
  countElem.classList.add("card-count");
  countElem.innerText = count;
  handCard.appendChild(countElem);
  return handCard;
};

export const insertText = (parent, selector, text) => {
  parent.querySelector(selector).innerText = text;
};

export const cloneTemplate = (id) =>
  document.querySelector(id).content.cloneNode(true);

// ================== Render Functions ==================
const renderChildren = (selector, elements) => {
  document.querySelector(selector).replaceChildren(...elements);
};

export const renderMap = (svg) => {
  document.querySelector("#mapContainer").innerHTML = svg;
};

export const renderFaceupCards = (TCCardManager, cards) => {
  const elements = cards.map(createFaceUpCard(TCCardManager));
  renderChildren("#face-up-container", elements);
};

export const renderPlayerResources = ({
  trainCars,
  playerHandCards,
  destinationTickets,
}) => {
  document.querySelector("#cars").innerText = trainCars;
  const cards = playerHandCards
    .filter(({ count }) => count > 0)
    .map(createPlayerHandCard);
  const tickets = destinationTickets.map(createTicketCard);
  renderChildren("#player-hand", cards);
  renderChildren("#player-ticket-cards", tickets);
};

export const renderPlayerCards = (players, currentPlayerID) => {
  const container = document.getElementById("players-container");
  container.replaceChildren();

  players.forEach(({ id, name, trainCars, trainCarCards, tickets }) => {
    const card = cloneTemplate("#player-card");
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

export const unBlockCurrentPlayer = (isCurrentPlayer) => {
  const actions = document.querySelectorAll(".action");
  actions.forEach((el) => el.classList.toggle("disable", !isCurrentPlayer));
};

export const masterRender = ({
  map,
  faceUpCards,
  playerResources,
  players,
  isActive,
  currentPlayerID,
}) => {
  renderMap(map);
  renderFaceupCards(getDrawTCCInstance(), faceUpCards);
  renderPlayerResources(playerResources);
  renderPlayerCards(players, currentPlayerID);
  unBlockCurrentPlayer(isActive);
};

// ================== Ticket Handling ==================
const highlightTicket = (ticket) => ticket.classList.toggle("selected");

const handleTicketSelection = (ticket, ticketManager) => () => {
  highlightTicket(ticket);
  ticketManager.toggleSelection(ticket.dataset.ticketId);
};

const confirmTickets = (ticket, ticketManager) => async () => {
  const confirmed = await ticketManager.confirmTickets(ticket.dataset.ticketId);
  if (!confirmed) return;
  ContinueGame();

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

// ================== Draw Blind Card ==================
const drawBlindCard = () => {
  document
    .getElementById("blind-cards")
    .addEventListener("dblclick", () => getDrawTCCInstance().drawBlindCard());
};

// ================== Page Render ==================
const renderPage = () => {
  renderMap();
  renderFaceupCards(drawTCCInstance());
  renderPlayerCards();
  renderPlayerResources();
  drawBlindCard();
};

const poll = () => {
  const intervalId = setInterval(async () => {
    const { isActive } = await fetchJSON("/game/player/status");

    if (isActive) {
      return clearInterval(intervalId);
    }

    renderPage();
  }, 2000);
};

const main = async () => {
  const destinationBtn = document.querySelector("#destination-tickets");
  const dtHandler = () => drawDestinationCards(new DestinationTickets());
  destinationBtn.addEventListener("click", dtHandler);
  const { state } = await fetchJSON("/game/player/status");

  if (state === "setup") {
    drawDestinationCards(new DestinationTickets());
  }

  renderPage();
  poll();
};

globalThis.onload = main;
