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

  startSongSelection(tournamentId, matchId) {
    return backend.post(`/tournaments/${tournamentId}/matches/${matchId}/startSongSelection`);
  },

  addSongVote(tournamentId, matchId, vote) {
    return backend.post(`/tournaments/${tournamentId}/matches/${matchId}/votes`, vote);
  },

  endSongSelection(tournamentId, matchId) {
    return backend.post(`/tournaments/${tournamentId}/matches/${matchId}/endSongSelection`);
  },

  createTournament(data) {
    return backend.post("/tournaments", data).then(response => response.data);
  },

  getTournaments() {
    return backend.get("/tournaments").then(response => response.data);
  },

  websocketUrl: process.env.REACT_APP_WS_BACKEND || "ws://localhost:8080"
};
