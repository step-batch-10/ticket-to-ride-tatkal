import { fetchJSON } from "./draw_tickets.js";

const cloneTemplate = (templateId) => {
  const temp = document.getElementById(templateId);
  const clone = temp.content.cloneNode(true);

  return clone;
};

const createScoreBoard = (scoreBoard) => {
  const table = document.getElementById("table-body");
  const clone = cloneTemplate("score-card-template");
  const tr = clone.querySelector("tr");
  tr.setAttribute("data-bs-toggle", "offcanvas");
  tr.setAttribute("data-bs-target", `#score-card-${scoreBoard.playerName}`);
  tr.querySelector(".player-name").innerText = scoreBoard.playerName;
  tr.querySelector(".destination-score").innerText =
    scoreBoard.destinationScore;
  tr.querySelector(".routes-score").innerText = scoreBoard.routeScore;
  tr.querySelector(".total-score").innerText = scoreBoard.totalScore;
  table.append(clone);
};

const styleOffcanvas = (offcanvas) => {
  offcanvas.style.width = "50vw";
  offcanvas.style.height = "fit-content";
  offcanvas.style.position = "absolute";
  offcanvas.style.left = "25%";
  offcanvas.style.top = "10%";
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

const AddBonusScore = (scoreCard, offcanvasClone) => {
  const bonusPoint = scoreCard.bonusPoints;
  if (bonusPoint) {
    const bonusScore = offcanvasClone.querySelector(".longest-path");
    const h3 = document.createElement("h3");
    h3.innerText = "Longest path";
    const p = document.createElement("h3");
    p.innerText = bonusPoint;
    bonusScore.append(h3, p);
  }
};

const setCanvas = (offcanvasClone, scoreCard) => {
  const player = offcanvasClone.querySelector(".offcanvas-title");
  player.innerText = scoreCard.playerName;
  const offcanvasDiv = offcanvasClone.querySelector("div");
  offcanvasDiv.setAttribute("id", `score-card-${scoreCard.playerName}`);
  styleOffcanvas(offcanvasDiv);
  AddBonusScore(scoreCard, offcanvasClone);
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

const showWinner = (winner) => {
  const ele = document.querySelector(".winner");
  ele.innerText = `Winner ${winner}`;
};

const main = async () => {
  const scoreCards = await fetchJSON("/game/scoreCards");
  const { scoreBoard, winner } = await fetchJSON("/game/scoreBoard");
  showWinner(winner);

  scoreBoard.forEach((sb) => {
    createScoreBoard(sb);
  });

  scoreCards.forEach((sc) => {
    createOffcanvas(sc);
  });
};

globalThis.onload = main;
