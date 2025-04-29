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

export const createTicketCard = ({
  from,
  to,
  fromCity,
  toCity,
  points,
  id,
}) => {
  const ticketCard = createDiv(["player-ticket-card"]);
  ticketCard.innerText =
    `from: ${fromCity} → to: ${toCity} → points: ${points}`;
  ticketCard.dataset.ticketId = id;
  ticketCard.addEventListener("click", () => {
    highlightTicket(ticketCard, { from, to });
  });
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

const removeAllHighlightRoutes = () => {
  const highlightedRoutes = document.querySelectorAll(".highlight-routes");

  highlightedRoutes.forEach((r) => {
    r.classList.toggle("highlight-routes");
    r.style.stroke = "#373737";
    r.style.strokeWidth = "0.965281";
  });
};

const highlightRoute = (id) => {
  const routeContainer = document.querySelector(`#${id}`);
  const rectangles = routeContainer.querySelectorAll("rect");

  rectangles.forEach((r) => {
    r.classList.add("highlight-routes");
    r.style.stroke = "white";
    r.style.strokeWidth = "2px";
  });
};

const selectHandCard = async (e) => {
  removeAllHighlightRoutes();
  const currentCard = e.currentTarget;
  currentCard.classList.toggle("selected-train-card-hand");
  const color = currentCard.classList[1];
  const claimableRoutes = await fetchJSON(
    `/game/player/claimable-routes?color=${color}`,
  );

  claimableRoutes.forEach((cR) => {
    highlightRoute(cR.id);
  });

  getClaimRouteInstance().assignCardColor(color);
};

const createPlayerHandCard = ({ color, count }) => {
  const handCard = createTrainCarCard({ color });
  handCard.classList.add("hand-card");

  const countElem = document.createElement("p");
  countElem.classList.add("card-count");
  countElem.innerText = count;
  handCard.appendChild(countElem);
  handCard.addEventListener("click", selectHandCard);

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

const unBlockCurrentPlayer = (isCurrentPlayer, state) => {
  if (state !== "setup") {
    const actions = document.querySelectorAll(".action");
    actions.forEach((el) => el.classList.toggle("disable", !isCurrentPlayer));
  }
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
  if (state === "end") globalThis.location.href = "/score_board.html";
  renderFaceupCards(getDrawTCCInstance(), faceUpCards);
  renderPlayerResources(playerResources);
  renderPlayerCards(players, currentPlayerID);
  unBlockCurrentPlayer(isActive, state);
  renderLogs(logs);
  renderClaimedRoute(claimedRoutes);
  announceGameStateChange(state);
};

const glow = (ele, state) => {
  ele.style.fill = state ? "red" : "#583927";
  ele.style.mixBlendMode = state ? "normal" : "darken";
  ele.style.stroke = state ? "black" : "#583927";
  ele.style.strokeWidth = state ? "5px" : "0px";
};

const highlightStations = ({ from, to }, state) => {
  glow(document.querySelector(`#${from} ellipse`), state);
  glow(document.querySelector(`#${to} ellipse`), state);
};

const highlightTicket = (tag, ticket) => {
  const status = tag.classList.toggle("selected");

  highlightStations(ticket, status);

  return status;
};

const handleTicketSelection = (tag, ticketManager) => () => {
  ticketManager.toggleSelection(tag.dataset.ticketId);
};

const resetStations = (stations) => {
  stations.forEach((station) => {
    highlightStations(station, false);
  });
};

const confirmTickets = (tag, ticketManager, tickets) => async () => {
  const confirmed = await ticketManager.confirmTickets(tag.dataset.ticketId);
  resetStations(tickets);
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
    tag.addEventListener(
      "dblclick",
      confirmTickets(tag, ticketManager, tickets),
    );
  });

  displayTickets(ticketTags);
};

const drawBlindCard = () => {
  document
    .getElementById("blind-cards")
    .addEventListener("dblclick", () => getDrawTCCInstance().drawBlindCard());
};

const sendRequestToClaim = (e) => {
  removeAllHighlightRoutes();
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

const handleDestinationTicketDeck = async () => {
  const DTReqManager = new DestinationTickets(
    "/game/player/destination-tickets",
  );

  const SetUpDTReqManager = new DestinationTickets(
    "/game/setup/destination-tickets",
  );

  const DTDeck = document.querySelector("#destination-tickets");
  DTDeck.addEventListener("click", () => drawDestinationCards(DTReqManager));

  const { state } = await fetchJSON("/game/player/status");
  if (state === "setup") drawDestinationCards(SetUpDTReqManager);
};

const main = async () => {
  renderMap(await fetchJSON("/game/map"));
  handleDestinationTicketDeck();
  drawBlindCard();
  claimRoute();
  renderPage();
};

globalThis.onload = main;
