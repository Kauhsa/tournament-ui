import WebSocket from "ws";

import { wss } from "../index";
import { getTournamentState } from "./tournament";

export const broadcastTournamentState = async tournamentId => {
  for (let client of wss.clients) {
    if (client.readyState === WebSocket.OPEN && client.tournamentId === tournamentId) {
      const tournamentState = await getTournamentState(tournamentId);
      client.send(JSON.stringify(tournamentState));
    }
  }
};
