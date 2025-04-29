import { _ } from "https://cdn.skypack.dev/lodash";
import { Player } from "./player.ts";
import {
  GameScoreSummary,
  PlayerScore,
  RouteScore,
  Tickets,
} from "./schemas.ts";
import { Graph } from "https://esm.sh/@types/graphlib@2.1.12/index.d.ts";

export class ScoreBoard {
  private players: Player[];
  private routeScores: Map<number, number>;

  constructor(players: Player[]) {
    this.players = players;
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
    if (!neighbors) return false;

    return neighbors.some((n: string) =>
      this.isDestinationCompleted(n, to, graph, visited)
    );
  }

  private evaluateTickets(player: Player) {
    const destinationTickets = player.getDestinationTickets();
    const graph = player.getGraph();
    const tickets: Tickets[] = [];

    destinationTickets.forEach((ticket) => {
      const completed = this.isDestinationCompleted(
        ticket.from,
        ticket.to,
        graph,
      );

      tickets.push({ ...ticket, completed });
    });

    return tickets;
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

  private awardLongestPathBonus(playerScorecards: PlayerScore[]) {
    const playerLongestPaths = this.players.map((player) => {
      const graph = player.getGraph();
      return this.findLongestPathLength(graph);
    });

    const maxLength = Math.max(...playerLongestPaths);

    return playerScorecards.map((playerScore, index) => ({
      ...playerScore,
      longestPath: playerLongestPaths[index],
      bonusPoints: playerLongestPaths[index] === maxLength ? 10 : 0,
    }));
  }

  private getTotalRouteScores(routeScores: RouteScore[]) {
    return routeScores.reduce((sum, { totalPoints }) => sum + totalPoints, 0);
  }

  private getTotalDestinationScores(destinationTickets: Tickets[]) {
    const completed = destinationTickets.filter(({ completed }) => completed);
    return completed.reduce((sum, { points }) => sum + points, 0);
  }

  private getNoOfCompTickets(destinationTickets: Tickets[]) {
    return destinationTickets.filter(({ completed }) => completed).length;
  }

  private getIncompleteDestinationScore(destinationTickets: Tickets[]) {
    const completed = destinationTickets.filter(({ completed }) => !completed);
    return completed.reduce((sum, { points }) => sum + points, 0);
  }

  private createGameScoreSummary(playerScoreCard: PlayerScore) {
    const { playerName, routeScores, destinationTickets, bonusPoints } =
      playerScoreCard;
    const routeScore = this.getTotalRouteScores(routeScores);
    const destinationScore = this.getTotalDestinationScores(destinationTickets);
    const noOfCompletedTickets = this.getNoOfCompTickets(destinationTickets);
    const incompleteDestinationScore = this.getIncompleteDestinationScore(
      destinationTickets,
    );
    const totalScore = routeScore + destinationScore + bonusPoints! -
      incompleteDestinationScore;

    const gameScoreSummary: GameScoreSummary = {
      playerName,
      routeScore,
      destinationScore,
      totalScore,
      bonusPoints,
      noOfCompletedTickets,
    };

    return gameScoreSummary;
  }

  populatePlayerScoreBoard() {
    const playerScoreCards = this.players.map((player) =>
      this.playerScorecard(player)
    );

    return this.awardLongestPathBonus(playerScoreCards);
  }

  populateGameScoreSummary() {
    const playerScoreCards = this.populatePlayerScoreBoard();

    return playerScoreCards.map((scoreboard) =>
      this.createGameScoreSummary(scoreboard)
    );
  }

  getWinner() {
    const gameScoreSummary = this.populateGameScoreSummary();
    const highestScore = _.maxBy(gameScoreSummary, "totalScore").totalScore;
    const highScorers = gameScoreSummary.filter(
      (player) => player.totalScore === highestScore,
    );

    if (highScorers.length === 1) return highScorers[0].playerName;

    const winner = _.maxBy(highScorers, "noOfCompletedTickets");

    return winner.playerName;
  }
}
