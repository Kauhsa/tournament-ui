import express from "express";
import http from "http";
import WebSocket from "ws";
import FFA from "ffa";
import cors from "cors";

const app = express();
app.use(express.json());
app.use(cors({ origin: true }));
const server = http.createServer(app);
const wss = new WebSocket.Server({ server });

const newTournament = () => {
  return new FFA(12, { sizes: [6, 4, 4, 2], advancers: [4, 2, 2] });
};

let tournament = newTournament();

const getTournamentState = () => {
  return {
    matches: tournament.matches,
    advancers: tournament.advs,
    playerNames: [
      "Player 1",
      "Player 2",
      "Player 3",
      "Player 4",
      "Player 5",
      "Player 6",
      "Player 7",
      "Player 8",
      "Player 9",
      "Player 10",
      "Player 11",
      "Player 12"
    ]
  };
};

const broadcastTournamentState = () =>
  wss.clients.forEach(client => {
    if (client.readyState === WebSocket.OPEN) {
      client.send(JSON.stringify(getTournamentState()));
    }
  });

app.post("/reset", (req, res) => {
  tournament = newTournament();
  broadcastTournamentState();
  res.send("");
});

app.post("/score", (req, res) => {
  const { id, score } = req.body;

  const reason = tournament.unscorable(id, score);
  if (reason !== null) {
    res.status(400).send(reason);
    return;
  }

  tournament.score(id, score);
  broadcastTournamentState();
  res.send("");
});

app.get("/", (req, res) => {
  broadcastTournamentState();
  res.send({ msg: "hello" });
});

wss.on("connection", ws => {
  ws.send(JSON.stringify(getTournamentState()));
});

server.listen(process.env.PORT || 8080, function listening() {
  // eslint-disable-next-line no-console
  console.log("Listening on %d", server.address().port);
});
