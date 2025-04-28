import { _ } from "https://cdn.skypack.dev/lodash";
import { Graph } from "https://esm.sh/graphlib@2.1.8";
import {
  card,
  playerHandCard,
  PlayerInfo,
  PlayerResources,
  Route,
  Tickets,
} from "./schemas.ts";

export class Player {
  private id: string;
  private name: string;
  private trainCars: number;
  private hand: playerHandCard[];
  private destinationTickets: Tickets[];
  private color: string;
  private claimedRoutes: Route[];
  private graph: Graph;

  constructor(PlayerDetails: PlayerInfo, color: string) {
    this.id = PlayerDetails.id;
    this.name = PlayerDetails.name;
    this.trainCars = 45;
    this.hand = this.initializeHand();
    this.destinationTickets = [];
    this.claimedRoutes = [];
    this.color = color;
    this.graph = new Graph({ directed: false });
  }

  private initializeHand() {
    const colors = [
      "red",
      "blue",
      "green",
      "yellow",
      "black",
      "white",
      "orange",
      "pink",
      "locomotive",
    ];
    return colors.map((color) => ({ color, count: 0 }));
  }

  addCardsToHand(...cards: card[]) {
    cards.forEach((card) => {
      const colorCards = this.hand.find(({ color }) => color === card.color);
      colorCards!.count++;
    });
  }

  addClaimedRoute(route: Route) {
    return this.claimedRoutes.push(route);
  }

  addEdge(route: Route) {
    this.graph.setEdge(route.cityA, route.cityB, { distance: route.distance });
  }

  getGraph() {
    return this.graph;
  }

  getClaimedRoutes() {
    return this.claimedRoutes;
  }

  getTrainCars() {
    return this.trainCars;
  }

  deductTrainCars(usedCars: number) {
    this.trainCars -= usedCars;
    return this.trainCars;
  }

  deductTrainCarCards(usedCards: playerHandCard[]): card[] {
    return usedCards.flatMap((c) => {
      const card = _.find(this.hand, { color: c.color });
      card.count -= c.count;

      return new Array(c.count).fill({ color: c.color });
    });
  }

  getName() {
    return this.name;
  }

  getHand() {
    return this.hand;
  }

  getId() {
    return this.id;
  }

  addDestinationTickets(tickets: Tickets[]) {
    return this.destinationTickets.push(...tickets);
  }

  getDestinationTickets() {
    return this.destinationTickets;
  }

  status() {
    return {
      id: this.id,
      name: this.name,
      color: this.color,
      trainCars: this.trainCars,
      trainCarCards: this.hand.reduce((total, card) => card.count + total, 0),
      tickets: this.destinationTickets.length,
    };
  }

  getColor() {
    return this.color;
  }

  getPlayerResources(): PlayerResources {
    return {
      ...this.status(),
      destinationTickets: this.getDestinationTickets(),
      playerHandCards: this.getHand(),
    };
  }
}
