// const renderMap = async () => {
//   const response = await fetch("/game/map");
//   const map = await response.json();
//   const mapContainer = document.querySelector("#mapContainer");
//   mapContainer.innerHTML = map.svg;
// };

// const cloneTemplate = (id) => {
//   const clone = document.querySelector(id);

//   return clone.content.cloneNode(true);
// };

// const highlightPick = (ticketTag) => {
//   const list = ticketTag.classList;

//   list.toggle("selected");
// };

// const insertTagInfo = (parentTag, selector, data) => {
//   const tag = parentTag.querySelector(selector);
//   tag.innerText = data;
// };

// const generateTicket = (ticket) => {
//   const ticketTemplate = cloneTemplate("#ticket-template");
//   const ticketTag = ticketTemplate.querySelector(".ticket");

//   insertTagInfo(ticketTemplate, ".from-station", ticket.from);
//   insertTagInfo(ticketTemplate, ".to-station", ticket.to);
//   insertTagInfo(ticketTemplate, ".points", ticket.points);

//   ticketTag.id = ticket.id;
//   ticketTag.addEventListener("click", () => highlightPick(ticketTag));

//   return ticketTag;
// };

// const displayTickets = (tickets) => {
//   const ticketsSelector = cloneTemplate("#ticket-selector-template");
//   const container = ticketsSelector.querySelector("#ticket-container");
//   const ticketTags = tickets.map(generateTicket);

//   container.append(...ticketTags);
//   const ticketArea = document.querySelector(".ticket-display");
//   ticketArea.classList.add("align-right");
//   ticketArea.replaceChildren(ticketsSelector);
// };

// const sumbitTicketChoices = (threshold) => async () => {
//   const container = document.querySelector("#ticket-container");
//   const selectedTickets = container.querySelectorAll(".selected");
//   const ticketIds = Array.from(selectedTickets).map((t) => t.id);
//   if (selectedTickets.length < threshold) return;

//   const body = JSON.stringify({ ticketIds });
//   const ticketArea = document.querySelector(".ticket-display");
//   ticketArea.classList.remove("align-right");

//   await fetch("/game/destination-tickets", {
//     method: "POST",
//     body,
//   });
//   renderPlayerCards();
//   renderPlayerResources();
//   document.querySelector("#ticket-selection").remove();
// };

// const handleTicketsSelection = (destinationCards) => {
//   const { tickets, minimumPickup } = destinationCards;
//   displayTickets(tickets);
//   const chooseBtn = document.querySelector("#choose-tickets");
//   chooseBtn.addEventListener("click", sumbitTicketChoices(minimumPickup));
// };

// const createTrainCarCard = (card) => {
//   const div = document.createElement("div");
//   div.classList.add("train-car-card");
//   div.style.backgroundColor = card.color;
//   div.innerText = card.color;
//   return div;
// };

// const createPlayerHandCard = (card) => {
//   const div = document.createElement("div");
//   div.classList.add("train-car-card");
//   div.style.backgroundColor = card.color;
//   div.innerText = card.color;
//   const count = document.createElement("p");
//   count.innerText = card.count;
//   div.appendChild(count);
//   return div;
// };
// const createTicketCard = (card) => {
//   const div = document.createElement("div");
//   div.classList.add("player-ticket-card");
//   div.innerText = ` from : ${card.from}--> to:${card.to} --->points${card.points}`;
//   return div;
// };

// const renderPlayerResources = async () => {
//   const res = await fetch("/game/player/properties");
//   const resources = await res.json();
//   const carsContainer = document.querySelector("#cars");
//   carsContainer.innerText = resources.cars;
//   const playerHandContainer = document.querySelector("#player-hand");
//   const cards = resources.hand.map(createPlayerHandCard);
//   playerHandContainer.replaceChildren(...cards);
//   console.log(resources);

//   const tickets = resources.tickets.map(createTicketCard);
//   const ticketContainer = document.querySelector("#player-ticket-cards");
//   ticketContainer.replaceChildren(...tickets);
// };

// const renderFaceupCards = async () => {
//   const res = await fetch("/game/face-up-cards");
//   const cards = await res.json();

//   const faceUpDivs = cards.map(createTrainCarCard);
//   const faceupContainer = document.querySelector("#face-up-container");
//   faceupContainer.append(...faceUpDivs);
// };

// const drawDestinationCards = async () => {
//   const res = await fetch("/game/destination-tickets");
//   const destinationCards = await res.json();
//   handleTicketsSelection(destinationCards);
// };

// const getPlayerCard = (name, trainCars, trainCarCards, tickets) => {
//   const card = cloneTemplate("#player-card");
//   insertTagInfo(card, ".player-name", name);
//   insertTagInfo(card, ".cars", `cars: ${trainCars}`);
//   insertTagInfo(card, ".train-car-cards", `train-cards: ${trainCarCards}`);
//   insertTagInfo(card, ".destination-cards", `tickets: ${tickets}`);
//   return card;
// };

// const createPlayerCard = (playerDetails, playerContainer) => {
//   playerDetails.forEach(({ name, trainCars, trainCarCards, tickets }) => {
//     const card = getPlayerCard(name, trainCars, trainCarCards, tickets);

//     playerContainer.append(card);
//   });
// };

// const renderPlayerCards = async () => {
//   const res = await fetch("/game/players-detail");
//   const playerDetails = await res.json();
//   const playerContainer = document.getElementById("players-container");
//   playerContainer.replaceChildren();

//   createPlayerCard(playerDetails, playerContainer);
// };

// const renderPage = () => {
//   renderMap();
//   renderFaceupCards();
//   renderPlayerCards();
//   renderPlayerResources();
//   drawDestinationCards();
// };

// const main = () => {
//   const _destinationBtn = document.querySelector("#destination-tickets");
//   // destinationBtn.addEventListener("click", drawDestinationCards);
//   renderPage();
// };

// globalThis.onload = main;
// ----- Helpers -----

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
  await fetch("/game/destination-tickets", {
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
  document.querySelector("#choose-tickets")
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

const renderFaceupCards = async () => {
  const cards = await fetchJSON("/game/face-up-cards");
  const cardElements = cards.map(createTrainCarCard);
  document.querySelector("#face-up-container").append(...cardElements);
};

const renderPlayerResources = async () => {
  const resources = await fetchJSON("/game/player/properties");

  document.querySelector("#cars").innerText = resources.cars;

  const handCards = resources.hand.map(createPlayerHandCard);
  document.querySelector("#player-hand").replaceChildren(...handCards);

  const ticketCards = resources.tickets.map(createTicketCard);
  document.querySelector("#player-ticket-cards").replaceChildren(
    ...ticketCards,
  );
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
