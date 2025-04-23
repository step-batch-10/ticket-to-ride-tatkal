import { Context } from "hono";
import { getCookie } from "hono/cookie";
import { Player } from "../models/player.ts";
import { Ttr } from "../models/ttr.ts";

export const fetchMap = (context: Context) => {
  const game = context.get("game");

  return context.json({ svg: game.getMap() });
};

export const fetchFaceUps = (context: Context) => {
  const game = context.get("game");
  return context.json(game.getFaceUpCards());
};

export const fetchTicketChoices = (c: Context) => {
  const TTR: Ttr = c.get("game");
  const minimumPickup = TTR.getState() === "setup" ? 2 : 1;
  const tickets = TTR.getDestinationTickets();

  const destinationTicketsInfo = { tickets, minimumPickup };

  return c.json(destinationTicketsInfo);
};

export const updatePlayerTickets = async (c: Context) => {
  const { selected, rest } = await c.req.json();
  const playerID = getCookie(c, "user-ID");
  const game = c.get("game");

  game.addDestinationTicketsTo(playerID, selected);
  game.stackUnderDestinationDeck(rest);

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

export const changePlayer = (context: Context) => {
  const game = context.get("game");
  game.changePlayer();
  return context.text("ok");
};
