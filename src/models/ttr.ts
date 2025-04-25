import {
  ActivityLog,
  card,
  City,
  GameStatus,
  playerHandCard,
  PlayerInfo,
  Route,
  svg,
  Tickets,
} from "./schemas.ts";
import { TrainCarCards } from "./train_car_cards.ts";
import DestinationTickets from "./tickets.ts";
import { Player } from "./player.ts";
import { UsMap } from "./USA_map.ts";
import { _ } from "https://cdn.skypack.dev/lodash";

export class Ttr {
  private players: Player[];
  private map: UsMap;
  private trainCarCards: TrainCarCards;
  private destinationCards: DestinationTickets;
  private currentPlayer: Player;
  private currentPlayerIndex: number;
  private moves: number;
  private logs: ActivityLog[];
  private state: "setup" | "playing" | "finalTurn";

  constructor(players: Player[], map: UsMap) {
    this.players = players;
    this.map = map;
    this.trainCarCards = new TrainCarCards();
    this.destinationCards = map.getDestinationTickets();
    this.initializePlayers();
    this.state = "setup";
    this.currentPlayerIndex = 0;
    this.moves = 0;
    this.currentPlayer = this.players[this.currentPlayerIndex];
    this.logs = [];
  }
  private registerLog(from: string, assets: string | number) {
    this.logs.unshift({
      playerName: this.currentPlayer!.getName(),
      from,
      assets,
    });
  }

  drawFaceUpCard(index: number) {
    const drawnCard = this.trainCarCards.drawFaceUp(index);
    this.registerLog("face up cards", drawnCard.color);

    this.currentPlayer.addCardsToHand(drawnCard);
    return drawnCard;
  }

  drawBlindCard() {
    const drawnCard = this.trainCarCards.drawCard()!;
    this.registerLog("deck", "a");

    this.currentPlayer.addCardsToHand(drawnCard);

    return drawnCard;
  }

  private initializePlayers() {
    this.players.forEach((player) => {
      const cards = new Array(4).fill("").map(() => {
        return this.trainCarCards.drawCard()!;
      });
      player.addCardsToHand(...cards);
    });
  }

  static createTtr(players: PlayerInfo[], map: UsMap) {
    const colors = [
      "red",
      "blue",
      "green",
      "yellow",
      "black",
      "white",
      "orange",
      "pink",
    ];
    const playerInstances = players.map((playerInfo, index) => {
      return new Player(playerInfo, colors[index]);
    });

    return new Ttr(playerInstances, map);
  }

  getMap(): svg {
    return this.map.getMap();
  }

  getCities(): City[] {
    return this.map.getCities();
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
    this.registerLog("destination tickets", tickets.length);
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
    const currentPlayerID = this.currentPlayer.getId();
    const stats: GameStatus = {
      currentPlayerID,
      isActive: playerID === currentPlayerID,
      players: this.getPlayerDetails(),
      map: this.getMap(),
      playerResources: this.getPlayer(playerID)!.getPlayerResources(),
      faceUpCards: this.getFaceUpCards(),
      state: this.state,
      logs: this.logs,
    };

    return stats;
  }

  getState() {
    return this.state;
  }

  changePlayer() {
    this.currentPlayerIndex = (this.currentPlayerIndex + 1) %
      this.players.length;
    this.moves += 1;

    if (this.moves === this.players.length) {
      this.state = "playing";
    }

    this.currentPlayer = this.players[this.currentPlayerIndex];
    return true;
  }

  private getUsedTrainCarCards(
    noOfColorCards: number,
    route: Route,
    cardColor: string,
  ) {
    const usedTrainCarCards: playerHandCard[] = [];
    if (noOfColorCards - route.distance >= 0) {
      usedTrainCarCards.push({ color: cardColor, count: route.distance });
      return usedTrainCarCards;
    }

    usedTrainCarCards.push(
      { color: cardColor, count: noOfColorCards },
      { color: "locomotive", count: route.distance - noOfColorCards },
    );
    return usedTrainCarCards;
  }

  private getRouteStatus(
    route: Route,
    playerHand: playerHandCard[] | undefined,
    cardColor: string,
  ) {
    const isCardUsable = !(
      route.color === cardColor ||
      route.color === "gray" ||
      cardColor === "locomotive"
    );
    if (isCardUsable) {
      return { claimable: false, usedTrainCarCards: [] };
    }

    const isLocomotive = cardColor === "locomotive";
    const noOfColorCards = _.find(playerHand, { color: cardColor }).count;
    const noOfLocomotives = _.find(playerHand, { color: "locomotive" }).count;
    const totalCards = isLocomotive
      ? noOfLocomotives
      : noOfColorCards + noOfLocomotives;

    const claimable = route.distance <= totalCards;
    const usedTrainCarCards: playerHandCard[] = this.getUsedTrainCarCards(
      noOfColorCards,
      route,
      cardColor,
    );

    return { claimable, usedTrainCarCards };
  }

  claimRoute(playerID: string, routeId: string, cardColor: string) {
    const route = _.find(this.map.getRoutes(), { id: routeId });
    const player = this.getPlayer(playerID);
    const playerHand = player?.getHand();
    const routeStatus = this.getRouteStatus(route, playerHand, cardColor);
    if (!routeStatus.claimable) return false;

    player?.deductTrainCars(route.distance);
    player?.deductTrainCarCards(routeStatus.usedTrainCarCards);

    return true;
  }
}
