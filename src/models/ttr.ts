import { card, Game, svg, Tickets } from "./schemas.ts";
import { TrainCarCards } from "./train-car-cards.ts";
import DestinationTickets from "./tickets.ts";
import { Player } from "./player.ts";
import { PlayerInfo } from "../types.ts";
import { UsMap } from "./UsMap.ts";
// const getTickets = () => tickets;

export class Ttr implements Game {
  players: Player[];
  map: UsMap;
  trainCarCards: TrainCarCards;
  destinationCards: DestinationTickets;

  constructor(players: Player[], map: UsMap) {
    this.players = players;
    this.map = map;
    this.trainCarCards = new TrainCarCards();
    this.destinationCards = map.getDestinationTickets();

    this.initializePlayers();
  }

  private initializePlayers() {
    this.players.forEach((player) => {
      const cards = new Array(4).fill("").map(() => {
        return this.trainCarCards.drawCard();
      });
      player.addCardsToHand(...cards);
    });
  }

  static createTtr(players: PlayerInfo[], map: UsMap) {
    const playerInstances = players.map((playerInfo) => {
      return new Player(playerInfo);
    });
    return new Ttr(playerInstances, map);
  }

  getMap(): svg {
    return this.map.getMap();
  }

  getFaceUpCards(): card[] {
    return this.trainCarCards.getFaceUpCards();
  }

  getDestinationTickets(): Tickets[] {
    return this.destinationCards.getTopThree();
  }

  addDestinationTicketsTo(playerId: string, ticketIds: string[]) {
    const currentPlayer = this.players.find((player: Player) => {
      return player.getId() === playerId;
    });

    const tickets = this.destinationCards.getTickets(ticketIds);
    return currentPlayer?.addDestinationTickets(tickets);
  }

  getPlayers() {
    return this.players;
  }

  getPlayerDetails() {
    return this.players.map((player) => player.status());
  }
}
