import axios from "axios";

const backend = axios.create({
  baseURL: process.env.REACT_APP_BACKEND || "http://localhost:8080"
});

export default {
  submitScores(matchId, scores) {
    return backend.post("/score", { id: matchId, score: scores }).then(response => response.data);
  },

  reset() {
    return backend.post("/reset").then(response => response.data);
  },

  websocketUrl: process.env.REACT_APP_WS_BACKEND || "ws://localhost:8080"
};
