import mongoose from "mongoose";

const tournamentSchema = mongoose.Schema({
  players: [String],
  state: Object,
  options: {
    sizes: [Number],
    advancers: [Number]
  }
});

export default mongoose.model("Tournament", tournamentSchema);
