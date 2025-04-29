import { Context } from "hono";
import { deleteCookie, getCookie } from "hono/cookie";
import { Player } from "../models/player.ts";
import { Ttr } from "../models/ttr.ts";
import { City, Tickets } from "../models/schemas.ts";
import { _ } from "https://cdn.skypack.dev/lodash";

export const fetchMap = (context: Context) => {
  const game = context.get("game");

  return context.json({ svg: game.getMap() });
};

export const fetchFaceUps = (context: Context) => {
  const game = context.get("game");
  return context.json(game.getFaceUpCards());
};

export const assignRouteCities = (cities: City[], tickets: Tickets[]) => {
  return tickets.map((t) => {
    const from = _.find(cities, { id: t.from });
    const to = _.find(cities, { id: t.to });

    return { ...t, fromCity: from.name, toCity: to.name };
  });
};

export const fetchTicketChoices = (c: Context) => {
  const ttr: Ttr = c.get("game");
  const cities = ttr.getCities();
  const minimumPickup = ttr.getMinimumPickUp();
  const tickets = assignRouteCities(cities, ttr.getDestinationTickets());
  const destinationTicketsInfo = { tickets, minimumPickup };

  return c.json(destinationTicketsInfo);
};

export const updatePlayerTickets = async (c: Context) => {
  const { selected, rest } = await c.req.json();
  const playerID = getCookie(c, "user-ID");
  const ttr = c.get("game");
  const cities = ttr.getCities();
  const selectedTickets = assignRouteCities(cities, selected);

  ttr.addDestinationTicketsTo(playerID, selectedTickets);
  ttr.stackUnderDestinationDeck(rest);

  return c.text("ok", 200);
};

export const fetchPlayerHand = (context: Context) => {
  const game = context.get("game");
  const playerId = getCookie(context, "user-ID");

  const currentPlayer = game.getPlayers().find((player: Player) => {
    return player.getId() === playerId;
  });

  if (!currentPlayer) {
    return context.json({ message: "player not found" }, 404);
  }
  const properties = {
    hand: currentPlayer.getHand(),
    cars: currentPlayer.getTrainCars(),
    tickets: currentPlayer.getDestinationTickets(),
  };
  return context.json(properties);
};

export const fetchPlayerDetails = (context: Context) => {
  const game = context.get("game");
  const players = game.getPlayerDetails();

  return context.json(players);
};

export const drawFaceUpCard = async (context: Context) => {
  const { index } = await context.req.json();
  const card = context.get("game").drawFaceUpCard(index);

  return context.json(card);
};

export const drawCardFromDeck = (context: Context) => {
  const game = context.get("game");
  const card = game.drawBlindCard();

  return context.json(card);
};

export const fetchGameStatus = (context: Context) => {
  const game = context.get("game");
  const playerId = getCookie(context, "user-ID");

  return context.json(game.status(playerId));
};

export const handleClaimRoute = async (context: Context) => {
  const { routeId, cardColor } = await context.req.json();
  const playerId = getCookie(context, "user-ID");
  const game = context.get("game");
  const claimed = game.claimRoute(playerId, routeId, cardColor);

  return context.json({ claimed });
};

export const fetchClaimableRoute = (context: Context) => {
  const color = context.req.query("color");
  const playerId = getCookie(context, "user-ID");
  const game = context.get("game");

  const claimableRoutes = game.claimableRoutes(playerId, color);

  return context.json(claimableRoutes);
};

export const fetchScoreCard = (context: Context) => {
  const game = context.get("game");
  const scoreCard = game.getScoreCard();

  return context.json(scoreCard);
};

export const exitHandler = (context: Context) => {
  deleteCookie(context, "game-ID");

  return context.redirect("/");
};
