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

const insertTicketInfo = (parentTag, selector, data) => {
  const tag = parentTag.querySelector(selector);
  tag.innerText = data;
};

const generateTicket = (ticket) => {
  const ticketTemplate = cloneTemplate("#ticket-template");
  const ticketTag = ticketTemplate.querySelector(".ticket");

  insertTicketInfo(ticketTemplate, ".from-station", ticket.from);
  insertTicketInfo(ticketTemplate, ".to-station", ticket.to);
  insertTicketInfo(ticketTemplate, ".points", ticket.points);

  ticketTag.id = ticket.id;
  ticketTag.addEventListener("click", () => highlightPick(ticketTag));

  return ticketTag;
};

const displayTickets = (tickets) => {
  const ticketsSelector = cloneTemplate("#ticket-selector-template");
  const container = ticketsSelector.querySelector(".tickets-container");
  const ticketTags = tickets.map(generateTicket);

  container.append(...ticketTags);
  document.querySelector(".tickets-display").replaceChildren(ticketsSelector);
};

const closePopUp = (threshold) => async () => {
  const selectedTickets = document.querySelectorAll(".selected");
  if (selectedTickets.length < threshold) return;
  await fetch("/game/destination-tickets", { method: "POST" });
  document.querySelector(".ticket-selection").remove();
};

const handleTicketsSelection = (destinationCards) => {
  const { tickets, mininumPickup } = destinationCards;
  displayTickets(tickets);
  const chooseBtn = document.querySelector("#choose-tickets");
  chooseBtn.addEventListener("click", closePopUp(mininumPickup));
};

const drawDestinationCards = async () => {
  const res = await fetch("/game/destination-tickets");
  const destinationCards = await res.json();
  handleTicketsSelection(destinationCards);
};

const createFaceUpCard = (card) => {
  const div = document.createElement("div");
  div.classList.add("face-up-card");
  div.style.backgroundColor = card.color;
  div.innerText = card.color;
  return div;
};

const renderFaceupCards = async () => {
  const res = await fetch("/game/face-up-cards");
  const cards = await res.json();

  const faceUpDivs = cards.map(createFaceUpCard);
  const faceupContainer = document.querySelector("#face-up-container");
  faceupContainer.append(...faceUpDivs);
};

const renderPage = () => {
  renderMap();
  renderFaceupCards();
};

const main = () => {
  const destinationBtn = document.querySelector("#destination-tickets");
  destinationBtn.addEventListener("click", drawDestinationCards);

  renderPage();
};

globalThis.onload = main;
