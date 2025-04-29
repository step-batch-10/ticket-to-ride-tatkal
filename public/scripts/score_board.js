import { fetchJSON } from "./draw_tickets.js";

const cloneTemplate = (templateId) => {
  const temp = document.getElementById(templateId);
  const clone = temp.content.cloneNode(true);

  return clone;
};

const createTable = (scoreCard) => {
  const table = document.getElementById("table-body");
  const clone = cloneTemplate("score-card-template");
  const tr = clone.querySelector("tr");
  tr.setAttribute("data-bs-toggle", "offcanvas");
  tr.setAttribute("data-bs-target", `#score-card-${scoreCard.playerName}`);

  table.append(clone);
};

const styleOffcanvas = (offcanvas) => {
  offcanvas.style.width = "50vw";
  offcanvas.style.height = "100vh";
  offcanvas.style.position = "absolute";
  offcanvas.style.left = "25%";
};

const createRow = (data) => {
  const tr = document.createElement("tr");
  data.forEach((d) => {
    const td = document.createElement("td");
    td.innerText = d;
    tr.append(td);
  });

  return tr;
};

const createRouteTable = (routeScores, offcanvas) => {
  const routeBody = offcanvas.getElementById("route-score-body");

  routeScores.forEach(({ count, points, totalPoints, trackLength }) => {
    const row = createRow([trackLength, points, count, totalPoints]);
    routeBody.append(row);
  });

  return routeBody;
};

const setCanvas = (offcanvasClone, scoreCard) => {
  const player = offcanvasClone.querySelector(".offcanvas-title");
  player.innerText = scoreCard.playerName;
  const offcanvasDiv = offcanvasClone.querySelector("div");
  offcanvasDiv.setAttribute("id", `score-card-${scoreCard.playerName}`);
  styleOffcanvas(offcanvasDiv);
  const routeScores = scoreCard.routeScores;
  createRouteTable(routeScores, offcanvasClone);
};

const createTicketBody = (tickets, ticketBody) => {
  tickets.forEach(({ fromCity, toCity, points }) => {
    const row = createRow([fromCity, toCity, points]);
    ticketBody.append(row);
  });

  return ticketBody;
};

const createTicket = (offcanvasClone, type, temp, tickets) => {
  const ticket = offcanvasClone.querySelector(type);
  const clone = cloneTemplate(temp);
  const heading = clone.querySelector(".heading");
  heading.innerText = type.slice(1);
  const ticketBody = clone.querySelector("#ticket-body");
  createTicketBody(tickets, ticketBody);
  ticket.append(clone);
};

const parse = (tickets, condition) => {
  const selectedTickets = tickets.filter(
    ({ completed }) => completed === condition,
  );

  if (!condition) {
    selectedTickets.map((t) => {
      t.points *= -1;
    });
  }

  return selectedTickets;
};

const createOffcanvas = (scoreCard) => {
  const offcanvasClone = cloneTemplate("offcanvas-template");
  setCanvas(offcanvasClone, scoreCard);
  const completedTickets = parse(scoreCard.destinationTickets, true);
  const incompletedTickets = parse(scoreCard.destinationTickets, false);

  createTicket(
    offcanvasClone,
    ".completed-tickets",
    "ticket-template",
    completedTickets,
  );

  createTicket(
    offcanvasClone,
    ".incompleted-tickets",
    "ticket-template",
    incompletedTickets,
  );

  document.querySelector("body").append(offcanvasClone);
};

const main = async () => {
  const scorecards = await fetchJSON("/game/scoreCards");

  scorecards.forEach((s) => {
    createTable(s);
    createOffcanvas(s);
  });
};

globalThis.onload = main;
