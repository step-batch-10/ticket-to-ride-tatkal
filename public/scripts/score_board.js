import { fetchJSON } from "./draw_tickets.js";

const cloneTemplate = (templateId) => {
  const temp = document.getElementById(templateId);
  const clone = temp.content.cloneNode(true);

  return clone;
};

const createTable = (player) => {
  const table = document.getElementById("table-body");
  const clone = cloneTemplate("score-card-template");
  const tr = clone.querySelector("tr");
  tr.setAttribute("data-bs-toggle", "offcanvas");
  tr.setAttribute("data-bs-target", `#score-card-${player}`);

  table.append(clone);
};

const styleOffcanvas = () => {
  offcanvas.style.width = "50vw";
  offcanvas.style.height = "100vh";
  offcanvas.style.position = "absolute";
  offcanvas.style.left = "25%";
};

const setCanvas = (offcanvasClone, player) => {
  offcanvas = offcanvasClone.querySelector("div");
  offcanvas.setAttribute("id", `score-card-${player}`);
  styleOffcanvas();
};

const createTicket = (offcanvasClone, types, temp) => {
  types.forEach((type) => {
    const ticket = offcanvasClone.querySelector(type);
    const clone = cloneTemplate(temp);
    ticket.append(clone);
  });
};

const createOffcanvas = (player) => {
  const offcanvasClone = cloneTemplate("offcanvas-template");
  setCanvas(offcanvasClone, player);
  createTicket(
    offcanvasClone,
    [".completed-tickets", ".incompleted-tickets"],
    "ticket-template",
  );
  document.querySelector("body").append(offcanvasClone);
};

const main = () => {
  // const scoreBoard = fetchJSON("/game/scoreBoard");
  const scorecards = fetchJSON("/game/scoreCards");
  console.log(scorecards);
  createTable("dhanoj");
  createOffcanvas("dhanoj");
};

globalThis.onload = main;
