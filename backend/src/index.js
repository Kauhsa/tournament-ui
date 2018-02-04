import express from "express";
import http from "http";
import WebSocket from "ws";
import FFA from "ffa";
import cors from "cors";
import mongoose from "mongoose";
import createPromiseRouter from "express-promise-router";
import url from "url";

import Tournament from "./model/Tournament";

const app = express();
app.use(express.json());
app.use(cors({ origin: true }));
const server = http.createServer(app);
const wss = new WebSocket.Server({ server });

mongoose.connect(process.env.MONGO_URL);

const getTournament = async id => {
  const tournament = await Tournament.findById(id);
  return FFA.restore(tournament.players.length, tournament.options, tournament.state);
};

const saveTournament = async (id, ffaTournament) => {
  const tournament = await Tournament.findById(id);
  tournament.state = ffaTournament.state.slice();
  await tournament.save();
};

const getTournamentState = async id => {
  const tournament = await Tournament.findById(id);
  const ffaTournament = FFA.restore(
    tournament.players.length,
    tournament.options,
    tournament.state
  );

  return {
    matches: ffaTournament.matches,
    advancers: ffaTournament.advs,
    playerNames: tournament.players
  };
};

const broadcastTournamentState = async tournamentId => {
  for (let client of wss.clients) {
    if (client.readyState === WebSocket.OPEN && client.tournamentId === tournamentId) {
      const tournamentState = await getTournamentState(tournamentId);
      client.send(JSON.stringify(tournamentState));
    }
  }
};

var router = createPromiseRouter();

router.post("/tournaments", async (req, res) => {
  const { players, sizes, advancers } = req.body;
  const options = { sizes, advancers };
  const invalidReason = FFA.invalid(players.length, options);

  if (invalidReason) {
    res.status(400).send(invalidReason);
    return;
  }

  const ffaTournament = new FFA(players.length, options);

  const tournament = await Tournament.create({
    players: players,
    options: options,
    state: ffaTournament.state.slice()
  });

  res.json({
    id: tournament.id
  });
});

router.post("/tournaments/:id/scores", async (req, res) => {
  const { id, score } = req.body;
  const tournament = await getTournament(req.params.id);

  const reason = tournament.unscorable(id, score);
  if (reason !== null) {
    res.status(400).send(reason);
    return;
  }

  tournament.score(id, score);
  await saveTournament(req.params.id, tournament);
  await broadcastTournamentState(req.params.id);
  res.sendStatus(200);
});

wss.on("connection", async (ws, req) => {
  try {
    const location = url.parse(req.url, true);
    const tournamentId = location.query.tournamentId;
    ws.tournamentId = tournamentId;
    const tournamentState = await getTournamentState(tournamentId);
    ws.send(JSON.stringify(tournamentState));
  } catch (e) {
    // eslint-disable-next-line no-console
    console.error(e);
  }
});

app.use(router);

server.listen(process.env.PORT || 8080, function listening() {
  // eslint-disable-next-line no-console
  console.log("Listening on %d", server.address().port);
});
