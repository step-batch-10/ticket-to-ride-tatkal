import { _ } from "https://cdn.skypack.dev/lodash";
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
import { USAMap } from "./USA_map.ts";

export class Ttr {
  private players: Player[];
  private map: USAMap;
  private trainCarCards: TrainCarCards;
  private destinationCards: DestinationTickets;
  private currentPlayer: Player;
  private currentPlayerIndex: number;
  private moves: number;
  private logs: ActivityLog[];
  private state: "setup" | "playing" | "finalTurn" | "end";
  private finalTurnInitiator: string | null;
  private currentAction: string | null;
  private noOfTCCsCollected: number;

  constructor(players: Player[], map: USAMap, tcc?: TrainCarCards) {
    this.players = players;
    this.map = map;
    this.trainCarCards = tcc || new TrainCarCards();
    this.destinationCards = map.getDestinationTickets();
    this.initializePlayers();
    this.state = "setup";
    this.currentPlayerIndex = 0;
    this.moves = 0;
    this.currentPlayer = this.players[this.currentPlayerIndex];
    this.logs = [];
    this.noOfTCCsCollected = 0;
    this.currentAction = null;
    this.finalTurnInitiator = null;
  }

  private registerLog(from: string, assets: string | number) {
    this.logs.unshift({
      playerName: this.currentPlayer!.getName(),
      from,
      assets,
    });
  }

  private getPlayer(playerID: string) {
    return this.players.find((player: Player) => {
      return player.getId() === playerID;
    });
  }

  private setCurrentAction(action: string | null) {
    this.currentAction = action;
  }

  private hasNoCurrentAction() {
    return this.currentAction === null;
  }

  private isCurrentActionTCC() {
    return this.currentAction === "TCC";
  }

  canDrawATCC(color?: string): Boolean {
    const isLocoFirst = color === "locomotive" && this.noOfTCCsCollected === 1;
    const isAllowed = this.hasNoCurrentAction() || this.isCurrentActionTCC();

    return !isLocoFirst && isAllowed;
  }

  canGetDestTickets() {
    return this.hasNoCurrentAction();
  }

  canChooseDestTickets() {
    return this.currentAction === "DT";
  }

  private hasDrawTCCActionOver(color: string | undefined) {
    return this.noOfTCCsCollected === 2 || color === "locomotive";
  }

  private handleTCCAction(color?: string) {
    this.noOfTCCsCollected += 1;

    if (this.hasDrawTCCActionOver(color)) {
      this.changePlayer();
      this.setCurrentAction(null);
      this.noOfTCCsCollected = 0;
    }

    this.setCurrentAction("TCC");
  }

  drawFaceUpCard(index: number) {
    const drawnCard = this.trainCarCards.drawFaceUp(index);

    this.registerLog("face up cards", drawnCard.color);
    this.currentPlayer.addCardsToHand(drawnCard);
    this.handleTCCAction(drawnCard.color);

    return drawnCard;
  }

  drawBlindCard() {
    const drawnCard = this.trainCarCards.drawCard()!;
    this.registerLog("deck", "a");

    this.currentPlayer.addCardsToHand(drawnCard);
    this.handleTCCAction();

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

  static createTtr(players: PlayerInfo[], map: USAMap, tcc?: TrainCarCards) {
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

    return new Ttr(playerInstances, map, tcc);
  }

  getMap(): svg {
    return this.map.getMap();
  }

  getCities(): City[] {
    return this.map.getCities();
  }

  private initiateFinalTurn(id: string) {
    this.state = "finalTurn";
    this.finalTurnInitiator = id;
  }

  getFaceUpCards(): card[] {
    return this.trainCarCards.getFaceUpCards();
  }

  getDestinationTickets(): Tickets[] {
    this.setCurrentAction("DT");
    return this.destinationCards.getTopThree();
  }

  addDestinationTicketsTo(playerId: string, tickets: Tickets[]) {
    this.setCurrentAction(null);
    const currentPlayer = this.getPlayer(playerId);
    this.registerLog("destination tickets", tickets.length);
    this.changePlayer();
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
      playerResources: this.getPlayer(playerID)!.getPlayerResources(),
      faceUpCards: this.getFaceUpCards(),
      state: this.state,
      logs: this.logs,
      claimedRoutes: this.map.getClaimedRoutes(),
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

    if (this.currentPlayer.getId() === this.finalTurnInitiator) {
      this.state = "end";
    }

    this.currentPlayer = this.players[this.currentPlayerIndex];

    return true;
  }

  private getUsedTrainCarCards(
    noOfColorCards: number,
    route: Route,
    cardColor: string,
  ): playerHandCard[] {
    const colorCardCount = Math.min(noOfColorCards, route.distance);
    const locomotiveCount = Math.max(0, route.distance - colorCardCount);

    return [
      { color: cardColor, count: colorCardCount },
      { color: "locomotive", count: locomotiveCount },
    ];
  }

  private canClaimRoute(route: Route, cardColor: string): boolean {
    const claimedRoute = _.find(this.map.getClaimedRoutes(), {
      carId: route.carId,
    });

    return (
      (route.color === cardColor ||
        route.color === "gray" ||
        cardColor === "locomotive") &&
      !claimedRoute
    );
  }

  private getCardCounts(playerHand: playerHandCard[], cardColor: string) {
    const noOfColorCards = _.find(playerHand, { color: cardColor })?.count;
    const noOfLocomotives = _.find(playerHand, { color: "locomotive" })?.count;
    const totalCards = cardColor === "locomotive"
      ? noOfLocomotives
      : noOfColorCards + noOfLocomotives;

    return { noOfColorCards, noOfLocomotives, totalCards };
  }

  private evaluateRouteClaim(
    route: Route,
    playerHand: playerHandCard[],
    cardColor: string,
  ) {
    if (!this.canClaimRoute(route, cardColor)) {
      return { claimable: false, usedTrainCarCards: [] };
    }

    const { noOfColorCards, totalCards } = this.getCardCounts(
      playerHand,
      cardColor,
    );
    const claimable = route.distance <= totalCards;
    const usedTrainCarCards = this.getUsedTrainCarCards(
      noOfColorCards,
      route,
      cardColor,
    );

    return { claimable, usedTrainCarCards };
  }

  private updatePlayerAfterClaim(
    player: Player,
    route: Route,
    usedCards: playerHandCard[],
  ) {
    player.deductTrainCars(route.distance);
    const deducted = player.deductTrainCarCards(usedCards);
    this.trainCarCards.discard(deducted);

    player.addClaimedRoute(route);
    this.map.addClaimedRoute({
      carId: route.carId,
      playerColor: player.getColor(),
    });
  }

  claimRoute(playerID: string, routeId: string, cardColor: string) {
    const route = _.find(this.map.getRoutes(), { id: routeId })!;
    const player = this.getPlayer(playerID)!;
    const playerHand = player.getHand()!;
    const { claimable, usedTrainCarCards } = this.evaluateRouteClaim(
      route,
      playerHand,
      cardColor,
    );
    if (!claimable) return false;

    this.updatePlayerAfterClaim(player, route, usedTrainCarCards);

    if (player.getTrainCars() < 3 && !this.finalTurnInitiator) {
      this.registerLog("claiming route", "final round");
      this.changePlayer();
      this.initiateFinalTurn(player.getId());
    }

    return true;
  }
}
