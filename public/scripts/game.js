const fetchJSON = async (url) => {
  const response = await fetch(url);
  return await response.json();
};

const cloneTemplate = (id) => {
  return document.querySelector(id).content.cloneNode(true);
};

const insertText = (parent, selector, text) => {
  parent.querySelector(selector).innerText = text;
};

const highlightTicket = (ticket) => {
  ticket.classList.toggle("selected");
};

// ----- Ticket Generation -----

const createTicketElement = (ticket) => {
  const ticketTemplate = cloneTemplate("#ticket-template");
  const ticketElement = ticketTemplate.querySelector(".ticket");

  insertText(ticketTemplate, ".from-station", ticket.from);
  insertText(ticketTemplate, ".to-station", ticket.to);
  insertText(ticketTemplate, ".points", ticket.points);

  ticketElement.id = ticket.id;
  ticketElement.addEventListener("click", () => highlightTicket(ticketElement));

  return ticketElement;
};

const displayTickets = (tickets) => {
  const selectorTemplate = cloneTemplate("#ticket-selector-template");
  const container = selectorTemplate.querySelector("#ticket-container");

  const ticketElements = tickets.map(createTicketElement);
  container.append(...ticketElements);

  const ticketDisplay = document.querySelector(".ticket-display");
  ticketDisplay.classList.add("align-right");
  ticketDisplay.replaceChildren(selectorTemplate);
};

const submitTicketChoices = (threshold) => async () => {
  const container = document.querySelector("#ticket-container");
  const selected = container.querySelectorAll(".selected");

  if (selected.length < threshold) return;

  const ticketIds = Array.from(selected).map((t) => t.id);
  await fetch("/game/player/destination-tickets", {
    method: "POST",
    body: JSON.stringify({ ticketIds }),
  });

  const ticketArea = document.querySelector(".ticket-display");
  ticketArea.classList.remove("align-right");

  await renderPlayerCards();
  await renderPlayerResources();
  document.querySelector("#ticket-selection")?.remove();
};

const handleTicketSelection = ({ tickets, minimumPickup }) => {
  displayTickets(tickets);
  document
    .querySelector("#choose-tickets")
    .addEventListener("click", submitTicketChoices(minimumPickup));
};

// ----- Card Creation -----

const createTrainCarCard = ({ color }) => {
  const card = document.createElement("div");
  card.className = "train-car-card";
  card.style.backgroundColor = color;
  card.innerText = color;
  return card;
};

const createPlayerHandCard = ({ color, count }) => {
  const card = createTrainCarCard({ color });
  const countEl = document.createElement("p");
  countEl.innerText = count;
  card.appendChild(countEl);
  return card;
};

const createTicketCard = ({ from, to, points }) => {
  const div = document.createElement("div");
  div.className = "player-ticket-card";
  div.innerText = `from: ${from} → to: ${to} → points: ${points}`;
  return div;
};

// ----- Rendering Functions -----

const renderMap = async () => {
  const { svg } = await fetchJSON("/game/map");
  document.querySelector("#mapContainer").innerHTML = svg;
};

const drawFaceUpEvent = (index) => async () => {
  const _res = await fetch("/game/player/drawFaceup-card", {
    method: "POST",
    body: JSON.stringify({ index }),
  });
  renderPlayerResources();
  renderFaceupCards();
  //remove when poll
};

const renderFaceupCards = async () => {
  const cards = await fetchJSON("/game/face-up-cards");
  const cardElements = cards.map((card, index) => {
    const faceUpCard = createTrainCarCard(card);
    faceUpCard.addEventListener("dblclick", drawFaceUpEvent(index));
    return faceUpCard;
  });
  document.querySelector("#face-up-container").replaceChildren(...cardElements);
};

const renderPlayerResources = async () => {
  const resources = await fetchJSON("/game/player/properties");

  document.querySelector("#cars").innerText = resources.cars;

  const handCards = resources.hand.map(createPlayerHandCard);
  document.querySelector("#player-hand").replaceChildren(...handCards);

  const ticketCards = resources.tickets.map(createTicketCard);
  document
    .querySelector("#player-ticket-cards")
    .replaceChildren(...ticketCards);
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

const drawDestinationCards = async () => {
  const destinationCards = await fetchJSON("/game/destination-tickets");
  handleTicketSelection(destinationCards);
};

const renderPage = () => {
  renderMap();
  renderFaceupCards();
  renderPlayerCards();
  renderPlayerResources();
  drawDestinationCards();
};

const main = () => {
  // const destinationBtn = document.querySelector("#destination-tickets");
  // destinationBtn.addEventListener("click", drawDestinationCards);
  renderPage();
};

globalThis.onload = main;
