import { DrawTCC } from "./draw-TCC.js";
import { DestinationTickets, fetchJSON } from "./draw-tickets.js";

const cloneTemplate = (id) => {
  return document.querySelector(id).content.cloneNode(true);
};

const insertText = (parent, selector, text) => {
  parent.querySelector(selector).innerText = text;
};

const highlightTicket = (ticket) => {
  ticket.classList.toggle("selected");
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

// ----- Card Creation -----------

const createTrainCarCard = ({ color }) => {
  const card = document.createElement("div");
  card.className = "train-car-card";
  card.style.backgroundColor = color;
  card.innerText = color;
  return card;
};

const createTicketCard = ({ from, to, points, id }) => {
  const div = document.createElement("div");

  div.classList.add("player-ticket-card");
  div.innerText = `from: ${from} → to: ${to} → points: ${points}`;
  div.setAttribute("id", id);

  return div;
};

const createFaceUpCard = (TCCardManager) => {
  return (card, index) => {
    const faceUpCard = createTrainCarCard(card);
    const handleDrawCard = TCCardManager.drawFaceUpCard.bind(
      TCCardManager,
      index,
      card.color,
    );

    faceUpCard.addEventListener("dblclick", handleDrawCard);

    return faceUpCard;
  };
};

// ----- Rendering Functions -----------

const renderMap = async () => {
  const { svg } = await fetchJSON("/game/map");
  document.querySelector("#mapContainer").innerHTML = svg;
};

const renderFaceupCards = async (TCCardManager) => {
  const cards = await fetchJSON("/game/face-up-cards");
  const cardElements = cards.map(createFaceUpCard(TCCardManager));
  document.querySelector("#face-up-container").replaceChildren(...cardElements);
};

const renderPlayerResources = async () => {
  const res = await fetch("/game/player/properties");
  const resources = await res.json();
  const carsContainer = document.querySelector("#cars");
  carsContainer.innerText = resources.cars;
  const playerHandContainer = document.querySelector("#player-hand");
  const cards = resources.hand.map(createTrainCarCard);
  playerHandContainer.replaceChildren(...cards);
  console.log(resources);

  const tickets = resources.tickets.map(createTicketCard);
  const ticketContainer = document.querySelector("#player-ticket-cards");
  ticketContainer.replaceChildren(...tickets);
};

const renderPlayerCards = async () => {
  const players = await fetchJSON("/game/players-detail");
  const container = document.getElementById("players-container");
  container.replaceChildren();

  players.forEach(({ name, trainCars, trainCarCards, tickets }) => {
    const card = cloneTemplate("#player-card");
    insertText(card, ".player-name", name);
    insertText(card, ".cars", `cars: ${trainCars}`);
    insertText(card, ".train-car-cards", `train-cards: ${trainCarCards}`);
    insertText(card, ".destination-cards", `tickets: ${tickets}`);
    container.append(card);
  });
};

// =============== draw Destination Tickets ========================

const handleTicketSelection = (ticket, ticketManager) => {
  return () => {
    const id = ticket.getAttribute("id");
    highlightTicket(ticket);
    ticketManager.toggleSelection(id);
  };
};

const confirmTickets = (ticket, ticketManager) => {
  return async () => {
    const id = ticket.getAttribute("id");
    const areConfirmed = await ticketManager.confirmTickets(id);
    if (!areConfirmed) return;
    await renderPlayerCards();
    await renderPlayerResources();

    const ticketArea = document.querySelector(".ticket-display");
    ticketArea.classList.remove("align-right");
    document.querySelector("#ticket-selection")?.remove();
  };
};

const drawDestinationCards = async (ticketManager) => {
  const tickets = await ticketManager.getTopThree();
  const tags = tickets.map(createTicketCard);
  tags.forEach((t) => {
    t.setAttribute("tabIndex", "0");
    t.addEventListener("click", handleTicketSelection(t, ticketManager));
    t.addEventListener("dblclick", confirmTickets(t, ticketManager));
  });

  displayTickets(tags);
};

const drawBlindCardEvent = async () => {
  const _res = await fetch("/game/player/draw-blind-card", {
    method: "POST",
  });

  renderPlayerCards(); //remove when poll
  renderPlayerResources();
};

const drawBlindCard = () => {
  const deck = document.getElementById("blind-cards");
  deck.addEventListener("dblclick", drawBlindCardEvent);
};

const getDrawCardInstance = () => {
  const instance = new DrawTCC();
  return () => instance;
};

const drawTCCInstance = getDrawCardInstance();

const renderPage = () => {
  renderMap();
  renderFaceupCards(drawTCCInstance());
  renderPlayerCards();
  renderPlayerResources();
  drawDestinationCards(new DestinationTickets());
  drawBlindCard();
};

const main = () => {
  const destinationBtn = document.querySelector("#destination-tickets");
  const dtHandler = () => drawDestinationCards(new DestinationTickets());
  destinationBtn.addEventListener("click", dtHandler);

  renderPage();
};

globalThis.onload = main;
