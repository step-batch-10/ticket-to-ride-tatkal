import { _ } from "https://cdn.skypack.dev/lodash";
import { Player } from "./player.ts";
import { PlayerScore } from "./schemas.ts";

export class ScoreBoard {
  private players: Player[];
  private playerScore: PlayerScore;

  constructor(players: Player[]) {
    this.players = players;
    this.playerScore = {
      routeScores: [],
    };
  }

  // playerScorecard(player: Player) {
  // }

  // populateScoreBoard() {
  //  return this.players.map(this.playerScorecard);
  // }
}
