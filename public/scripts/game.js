const renderMap = async () => {
  const response = await fetch("/game/map");
  const map = await response.json();
  const mapContainer = document.querySelector("#mapContainer");
  mapContainer.innerHTML = map.svg;
};

const cloneTemplate = (id) => {
  const clone = document.querySelector(id);

  return clone.content.cloneNode(true);
};

const highlightPick = (ticketTag) => {
  const list = ticketTag.classList;

  list.toggle("selected");
};

const insertTagInfo = (parentTag, selector, data) => {
  const tag = parentTag.querySelector(selector);
  tag.innerText = data;
};

const generateTicket = (ticket) => {
  const ticketTemplate = cloneTemplate("#ticket-template");
  const ticketTag = ticketTemplate.querySelector(".ticket");

  insertTagInfo(ticketTemplate, ".from-station", ticket.from);
  insertTagInfo(ticketTemplate, ".to-station", ticket.to);
  insertTagInfo(ticketTemplate, ".points", ticket.points);

  ticketTag.id = ticket.id;
  ticketTag.addEventListener("click", () => highlightPick(ticketTag));

  return ticketTag;
};

const displayTickets = (tickets) => {
  const ticketsSelector = cloneTemplate("#ticket-selector-template");
  const container = ticketsSelector.querySelector("#ticket-container");
  const ticketTags = tickets.map(generateTicket);

  container.append(...ticketTags);
  const ticketArea = document.querySelector(".ticket-display");
  ticketArea.classList.add("align-right");
  ticketArea.replaceChildren(ticketsSelector);
};

const sumbitTicketChoices = (threshold) => async () => {
  const container = document.querySelector("#ticket-container");
  const selectedTickets = container.querySelectorAll(".selected");
  const ticketIds = Array.from(selectedTickets).map((t) => t.id);
  if (selectedTickets.length < threshold) return;

  const body = JSON.stringify({ ticketIds });
  const ticketArea = document.querySelector(".ticket-display");
  ticketArea.classList.remove("align-right");

  await fetch("/game/destination-tickets", {
    method: "POST",
    body,
  });
  renderPlayerCards();
  renderPlayerResources();
  document.querySelector("#ticket-selection").remove();
};

const handleTicketsSelection = (destinationCards) => {
  const { tickets, minimumPickup } = destinationCards;
  displayTickets(tickets);
  const chooseBtn = document.querySelector("#choose-tickets");
  chooseBtn.addEventListener("click", sumbitTicketChoices(minimumPickup));
};

const createTrainCarCard = (card) => {
  const div = document.createElement("div");
  div.classList.add("train-car-card");
  div.style.backgroundColor = card.color;
  div.innerText = card.color;
  return div;
};
const createTicketCard = (card) => {
  const div = document.createElement("div");
  div.classList.add("player-ticket-card");
  div.innerText =
    ` from : ${card.from}--> to:${card.to} --->points${card.points}`;
  return div;
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

const renderFaceupCards = async () => {
  const res = await fetch("/game/face-up-cards");
  const cards = await res.json();

  const faceUpDivs = cards.map(createTrainCarCard);
  const faceupContainer = document.querySelector("#face-up-container");
  faceupContainer.append(...faceUpDivs);
};

const drawDestinationCards = async () => {
  const res = await fetch("/game/destination-tickets");
  const destinationCards = await res.json();
  handleTicketsSelection(destinationCards);
};

const getPlayerCard = (name, trainCars, trainCarCards, tickets) => {
  const card = cloneTemplate("#player-card");
  insertTagInfo(card, ".player-name", name);
  insertTagInfo(card, ".cars", `cars: ${trainCars}`);
  insertTagInfo(card, ".train-car-cards", `train-cards: ${trainCarCards}`);
  insertTagInfo(card, ".destination-cards", `tickets: ${tickets}`);
  return card;
};

const createPlayerCard = (playerDetails, playerContainer) => {
  playerDetails.forEach(({ name, trainCars, trainCarCards, tickets }) => {
    const card = getPlayerCard(name, trainCars, trainCarCards, tickets);

    playerContainer.append(card);
  });
};

const renderPlayerCards = async () => {
  const res = await fetch("/game/players-detail");
  const playerDetails = await res.json();
  const playerContainer = document.getElementById("players-container");
  playerContainer.replaceChildren();

  createPlayerCard(playerDetails, playerContainer);
};

const renderPage = () => {
  renderMap();
  renderFaceupCards();
  renderPlayerCards();
  renderPlayerResources();
  drawDestinationCards();
};

const main = () => {
  const _destinationBtn = document.querySelector("#destination-tickets");
  // destinationBtn.addEventListener("click", drawDestinationCards);

  renderPage();
};

globalThis.onload = main;
