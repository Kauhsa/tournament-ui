import express from "express";
import http from "http";
import WebSocket from "ws";
import cors from "cors";
import mongoose from "mongoose";
import url from "url";

import routes from "./routes";
import { getTournamentState } from "./service/tournament";

export const app = express();
app.use(express.json());
app.use(cors({ origin: true }));
const server = http.createServer(app);

export const wss = new WebSocket.Server({ server });

mongoose.connect(process.env.MONGO_URL);

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

app.use(routes);

server.listen(process.env.PORT || 8080, process.env.HOST || "0.0.0.0", function listening() {
  // eslint-disable-next-line no-console
  console.log("Listening on %s:%s", server.address().address, server.address().port);
});
