import { card, GameStatus, PlayerInfo, svg, Tickets } from "./schemas.ts";
import { TrainCarCards } from "./train-car-cards.ts";
import DestinationTickets from "./tickets.ts";
import { Player } from "./player.ts";
import { UsMap } from "./UsMap.ts";

export class Ttr {
  private players: Player[];
  private map: UsMap;
  private trainCarCards: TrainCarCards;
  private destinationCards: DestinationTickets;
  private currentPlayer: Player;
  private state: "setup" | "playing" | "finalTurn";

  constructor(players: Player[], map: UsMap) {
    this.players = players;
    this.map = map;
    this.trainCarCards = new TrainCarCards();
    this.destinationCards = map.getDestinationTickets();
    this.initializePlayers();
    this.state = "setup";
    this.currentPlayer = this.players[0];
  }

  drawFaceUpCard(index: number) {
    const drawnCard = this.trainCarCards.drawFaceUp(index);
    this.currentPlayer.addCardsToHand(drawnCard);

    return drawnCard;
  }

  drawBlindCard() {
    const drawnCard = this.trainCarCards.drawCard();
    this.currentPlayer.addCardsToHand(drawnCard);

    return drawnCard;
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

  private getPlayer(playerID: string) {
    return this.players.find((player: Player) => {
      return player.getId() === playerID;
    });
  }

  addDestinationTicketsTo(playerId: string, tickets: Tickets[]) {
    const currentPlayer = this.getPlayer(playerId);
    return currentPlayer?.addDestinationTickets(tickets);
  }

  stackUnderDestinationDeck(tickets: Tickets[]) {
    return this.destinationCards.stackUnderDeck(tickets);
  }

  getPlayers() {
    return this.players;
  }

  getCurrentPlayer() {
    return this.currentPlayer;
  }

  getPlayerDetails() {
    return this.players.map((player) => player.status());
  }

  status(playerID: string): GameStatus {
    const dummy: GameStatus = {
      currentPlayerID: "1",
      isActive: playerID === "1",
      players: this.getPlayerDetails(),
      map: this.getMap(),
      playerResources: this.currentPlayer.getPlayerResources(),
      faceUpCards: this.getFaceUpCards(),
      state: this.state,
    };

    return dummy;
  }
}
