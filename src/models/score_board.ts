import { _ } from "https://cdn.skypack.dev/lodash";
import { Player } from "./player.ts";
import { PlayerScore, RouteScore, Tickets } from "./schemas.ts";
import { Graph } from "https://esm.sh/@types/graphlib@2.1.12/index.d.ts";

export class ScoreBoard {
  private players: Player[];
  private routeScores: Map<number, number>;
  private tickets: Tickets[];

  constructor(players: Player[]) {
    this.players = players;
    this.tickets = [];
    this.routeScores = new Map([
      [1, 1],
      [2, 2],
      [3, 4],
      [4, 7],
      [5, 10],
      [6, 15],
    ]);
  }

  private createRouteScore(distance: number, routeScores: RouteScore[]) {
    const points = this.routeScores.get(distance)!;
    const count = 1;
    const totalPoints = points;

    routeScores.push({
      trackLength: distance,
      points,
      count,
      totalPoints,
    });
  }

  private updateRouteScore(routeScore: RouteScore) {
    routeScore.count++;
    routeScore.totalPoints += routeScore.points;
  }

  private getRouteScores(player: Player) {
    const routes = player.getClaimedRoutes();
    const routeScores: RouteScore[] = [];

    routes.forEach(({ distance }) => {
      const routeScore = _.find(routeScores, { trackLength: distance });

      if (!routeScore) return this.createRouteScore(distance, routeScores);

      this.updateRouteScore(routeScore);
    });

    return routeScores;
  }

  private isDestinationCompleted(
    from: string,
    to: string,
    graph: Graph,
    visited = new Set<string>(),
  ) {
    if (graph.hasEdge(from, to)) return true;
    if (visited.has(from)) return false;

    visited.add(from);
    const neighbors = graph.neighbors(from);

    return neighbors.some((n: string) =>
      this.isDestinationCompleted(n, to, graph, visited)
    );
  }

  getDestinationTickets() {
    return this.tickets;
  }

  private evaluateTickets(player: Player) {
    const destinationTickets = player.getDestinationTickets();
    const graph = player.getGraph();

    destinationTickets.forEach((ticket) => {
      const completed = this.isDestinationCompleted(
        ticket.from,
        ticket.to,
        graph,
      );

      this.tickets.push({ ...ticket, completed });
    });

    return this.tickets;
  }

  private playerScorecard(player: Player) {
    const playerScore: PlayerScore = {
      playerId: player.getId(),
      playerName: player.getName(),
      routeScores: this.getRouteScores(player),
      destinationTickets: this.evaluateTickets(player),
    };

    return playerScore;
  }

  populateScoreBoard() {
    return this.players.map((player) => this.playerScorecard(player));
  }

  private dfs(
    graph: Graph,
    node: string,
    traveledEdges: Set<string>,
    length: number,
    longestPathLength: { value: number },
  ) {
    const neighbors = graph.neighbors(node)!;

    longestPathLength.value = Math.max(longestPathLength.value, length);

    for (const neighbor of neighbors) {
      const edge = graph.edge(node, neighbor);
      const routeId = edge.id;

      if (!traveledEdges.has(routeId)) {
        traveledEdges.add(routeId);
        this.dfs(
          graph,
          neighbor,
          traveledEdges,
          length + edge.distance,
          longestPathLength,
        );
        traveledEdges.delete(routeId);
      }
    }
  }

  private findLongestPathLength(graph: Graph): number {
    const longestPathLength = { value: 0 };
    const traveledEdges = new Set<string>();

    for (const city of graph.nodes()) {
      this.dfs(graph, city, traveledEdges, 0, longestPathLength);
      traveledEdges.clear();
    }

    return longestPathLength.value;
  }

  awardLongestPathBonus(playerScorecards: Object[]) {
    const playerLongestPaths = this.players.map((player) => {
      const graph = player.getGraph();
      return this.findLongestPathLength(graph);
    });

    const maxLength = Math.max(...playerLongestPaths);

    return playerScorecards.map((playerScore, index) => ({
      ...playerScore,
      longestPathLength: playerLongestPaths[index],
      bonusPoints: playerLongestPaths[index] === maxLength ? 10 : 0,
    }));
  }
}
