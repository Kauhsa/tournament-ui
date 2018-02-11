import createPromiseRouter from "express-promise-router";

import {
  getTournaments,
  createTournament,
  addScore,
  startSongSelection
} from "./service/tournament";

import { broadcastTournamentState } from "./service/broadcast";

const router = createPromiseRouter();

router.get("/tournaments", async (req, res) => {
  res.json(await getTournaments());
});

router.post("/tournaments", async (req, res) => {
  try {
    const { players, sizes, advancers, name } = req.body;
    const tournament = await createTournament({ players, sizes, advancers, name });
    res.json({
      id: tournament.id
    });
  } catch (e) {
    res.status(400).send(e.message);
  }

  return;
});

router.post("/tournaments/:id/scores", async (req, res) => {
  try {
    const { id, score } = req.body;
    await addScore(req.params.id, id, score);
    await broadcastTournamentState(req.params.id);
    res.sendStatus(200);
  } catch (e) {
    res.status(400).send(e.message);
  }
});

router.post("/tournaments/:id/startSongSelection", async (req, res) => {
  try {
    const { id } = req.body;
    await startSongSelection(req.params.id, id);
    await broadcastTournamentState(req.params.id);
    res.sendStatus(200);
  } catch (e) {
    res.status(400).send(e.message);
  }
});

export default router;
