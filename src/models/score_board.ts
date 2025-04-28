import { _ } from "https://cdn.skypack.dev/lodash";
import { Player } from "./player.ts";
import { PlayerScore, Route, RouteScore } from "./schemas.ts";

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

  private getRouteScores(routes: Route[]) {
    const routeScores: RouteScore[] = [];

    routes.forEach(({ distance }) => {
      const routeScore = _.find(routeScores, { trackLength: distance });

      if (!routeScore) return this.createRouteScore(distance, routeScores);

      this.updateRouteScore(routeScore);
    });

    return routeScores;
  }

  private playerScorecard(player: Player) {
    const claimedRoutes = player.getClaimedRoutes();
    const playerScore: PlayerScore = {
      routeScores: this.getRouteScores(claimedRoutes),
    };

    return playerScore;
  }

  populateScoreBoard() {
    return this.players.map((player) => this.playerScorecard(player));
  }
}
