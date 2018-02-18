import createPromiseRouter from "express-promise-router";

import { getTournaments, createTournament, addScore } from "./service/tournament";
import { startSongSelection, endSongSelection, addSongVote } from "./service/songSelection";

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
    console.error(e);
    res.status(400).send(e.message);
  }

  return;
});

// gone soon
router.post("/tournaments/:id/scores", async (req, res) => {
  try {
    const { id, score } = req.body;
    await addScore(req.params.id, id, score);
    await broadcastTournamentState(req.params.id);
    res.sendStatus(200);
  } catch (e) {
    console.error(e);
    res.status(400).send(e.message);
  }
});

router.post("/tournaments/:tournamentId/matches/:matchId/startSongSelection", async (req, res) => {
  try {
    const { tournamentId, matchId } = req.params;
    await startSongSelection(tournamentId, matchId);
    await broadcastTournamentState(tournamentId);
    res.sendStatus(200);
  } catch (e) {
    console.error(e);
    res.status(400).send(e.message);
  }
});

router.post("/tournaments/:tournamentId/matches/:matchId/endSongSelection", async (req, res) => {
  try {
    const { tournamentId, matchId } = req.params;
    await endSongSelection(tournamentId, matchId);
    await broadcastTournamentState(tournamentId);
    res.sendStatus(200);
  } catch (e) {
    console.error(e);
    res.status(400).send(e.message);
  }
});

router.post("/tournaments/:tournamentId/matches/:matchId/votes", async (req, res) => {
  try {
    const { tournamentId, matchId } = req.params;
    await addSongVote(tournamentId, matchId, req.body);
    await broadcastTournamentState(tournamentId);
    res.sendStatus(200);
  } catch (e) {
    console.error(e);
    res.status(400).send(e.message);
  }
});

export default router;
