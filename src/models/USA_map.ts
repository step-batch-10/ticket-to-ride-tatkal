import { City, ClaimedRoute, Route, type svg, Tickets } from "./schemas.ts";
import { Reader } from "./schemas.ts";
import DestinationTickets from "./tickets.ts";
import routes from "../../json/routes.json" with { type: "json" };
import cities from "../../json/cities.json" with { type: "json" };

export class USAMap {
  private svg: svg;
  private destinationTickets;
  private routes: Route[];
  private cities: City[];
  private claimedRoutes: ClaimedRoute[];

  constructor(svg: string, tickets: Tickets[]) {
    this.svg = svg;
    this.destinationTickets = new DestinationTickets(tickets);
    this.routes = routes;
    this.cities = cities;
    this.claimedRoutes = [];
  }

  getMap(): svg {
    return this.svg;
  }

  getDestinationTickets(): DestinationTickets {
    return this.destinationTickets;
  }

  getRoutes(): Route[] {
    return this.routes;
  }

  getCities(): City[] {
    return this.cities;
  }

  addClaimedRoute(route: ClaimedRoute) {
    return this.claimedRoutes.push(route);
  }

  getClaimedRoutes() {
    return this.claimedRoutes;
  }

  static getInstance(reader: Reader) {
    const svg = reader("public/USA_map.html");
    const tickets = reader("json/tickets.json");
    return new USAMap(svg, JSON.parse(tickets));
  }
}
