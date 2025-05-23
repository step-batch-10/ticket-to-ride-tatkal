import { _ } from "https://cdn.skypack.dev/lodash";
import {
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
import { ScoreBoard } from "./score_board.ts";

export class Ttr {
  private players: Player[];
  private map: USAMap;
  private trainCarCards: TrainCarCards;
  private destinationCards: DestinationTickets;
  private currentPlayer: Player;
  private currentPlayerIndex: number;
  private moves: number;
  private logs: string[];
  private state: "setup" | "playing" | "finalTurn" | "end";
  private minimumPickup = 2;
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

  private registerLog(msg: string) {
    this.logs.unshift(msg);
  }

  getMinimumPickUp() {
    return this.minimumPickup;
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
      return;
    }

    this.setCurrentAction("TCC");
  }

  drawFaceUpCard(index: number) {
    const drawnCard = this.trainCarCards.drawFaceUp(index);

    this.registerLog(
      `${this.currentPlayer?.getName()} drawn ${drawnCard.color} color train car card`,
    );
    this.currentPlayer.addCardsToHand(drawnCard);
    this.handleTCCAction(drawnCard.color);

    return drawnCard;
  }

  drawBlindCard() {
    const drawnCard = this.trainCarCards.drawCard()!;
    this.registerLog(`${this.currentPlayer?.getName()} drawn 1 train car card`);

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
    this.registerLog(
      `${currentPlayer?.getName()} drawn ${tickets.length} ticket(s)`,
    );
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
      this.minimumPickup = 1;
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
  private canClaimRoute(
    playerId: string,
    route: Route,
    cardColor: string,
    totalCards: number,
  ) {
    const claimedRoutes = this.map.getClaimedRoutes();
    const claimedRoutesByPlayer = this.getPlayer(playerId)?.getClaimedRoutes();

    const canClaimDoubleRoute = route.isDoubleRoute
      ? !_.find(claimedRoutesByPlayer, { id: route.siblingRouteId })
      : true;
    const isUnclaimed = !_.some(claimedRoutes, { carId: route.carId });
    const isColorMatched = route.color === cardColor ||
      route.color === "gray" ||
      cardColor === "locomotive";

    return (
      isUnclaimed &&
      route.distance <= totalCards &&
      isColorMatched &&
      canClaimDoubleRoute
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

  canPerformClaimRoute() {
    return this.hasNoCurrentAction();
  }

  private evaluateRouteClaim(
    playerId: string,
    route: Route,
    playerHand: playerHandCard[],
    cardColor: string,
  ) {
    const { noOfColorCards, totalCards } = this.getCardCounts(
      playerHand,
      cardColor,
    );

    const claimable = this.canClaimRoute(
      playerId,
      route,
      cardColor,
      totalCards,
    );

    if (!claimable) {
      return { claimable, usedTrainCarCards: [] };
    }

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
    player.addEdge(route);

    this.changePlayer();
  }

  claimRoute(playerID: string, routeId: string, cardColor: string) {
    const route = _.find(this.map.getRoutes(), { id: routeId })!;
    const player = this.getPlayer(playerID)!;
    const playerHand = player.getHand()!;
    const { claimable, usedTrainCarCards } = this.evaluateRouteClaim(
      playerID,
      route,
      playerHand,
      cardColor,
    );
    if (!claimable) return false;

    this.updatePlayerAfterClaim(player, route, usedTrainCarCards);
    this.registerLog(`${player.getName()} claimed route`);
    if (player.getTrainCars() < 3 && !this.finalTurnInitiator) {
      this.registerLog(`${this.currentPlayer.getName()} initiated final turn`);
      this.initiateFinalTurn(player.getId());
    }

    return true;
  }

  claimableRoutes(playerId: string, cardColor: string) {
    const player = this.getPlayer(playerId)!;
    const routes = this.map.getRoutes();
    const { totalCards } = this.getCardCounts(player.getHand(), cardColor);

    const claimable = routes.filter((route) => {
      return this.canClaimRoute(playerId, route, cardColor, totalCards);
    });

    return claimable;
  }

  getScoreCard() {
    const sb = new ScoreBoard(this.players);
    const scoreCard = sb.populatePlayerScoreBoard();

    return scoreCard;
  }

  getScoreBoard() {
    const sb = new ScoreBoard(this.players);
    const scoreBoard = sb.populateGameScoreSummary();
    const winner = sb.getWinner();

    return { scoreBoard, winner };
  }
}
