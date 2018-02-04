import mongoose from "mongoose";

const tournamentSchema = mongoose.Schema({
  players: [String],
  states: Array,
  options: {
    sizes: [Number],
    advancers: [Number]
  }
});

export default mongoose.model("Tournament", tournamentSchema);
