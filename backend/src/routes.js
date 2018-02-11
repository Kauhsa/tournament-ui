import FFA from "ffa";
import createPromiseRouter from "express-promise-router";

import Tournament from "./model/Tournament";
import { getTournament, saveTournament } from "./service/tournament";
import { broadcastTournamentState } from "./service/broadcast";

const router = createPromiseRouter();

router.post("/tournaments", async (req, res) => {
  const { players, sizes, advancers, name } = req.body;
  const options = { sizes, advancers };
  const invalidReason = FFA.invalid(players.length, options);

  if (invalidReason) {
    res.status(400).send(invalidReason);
    return;
  }

  const ffaTournament = new FFA(players.length, options);

  const tournament = await Tournament.create({
    name: name,
    players: players,
    options: options,
    states: [ffaTournament.state.slice()]
  });

  res.json({
    id: tournament.id
  });
});

router.get("/tournaments", async (req, res) => {
  res.json((await Tournament.find()).map(t => t.dto()));
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

export default router;
