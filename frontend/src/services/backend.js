import axios from "axios";

const backend = axios.create({
  baseURL: process.env.REACT_APP_BACKEND || "http://localhost:8080"
});

export default {
  submitScores(tournamentId, matchId, scores) {
    return backend
      .post(`/tournaments/${tournamentId}/scores`, { id: matchId, score: scores })
      .then(response => response.data);
  },

  websocketUrl: process.env.REACT_APP_WS_BACKEND || "ws://localhost:8080"
};
