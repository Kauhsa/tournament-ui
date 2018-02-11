import mongoose from "mongoose";

const tournamentSchema = mongoose.Schema({
  name: String,
  players: [String],
  states: Array,
  options: {
    sizes: [Number],
    advancers: [Number]
  }
});

tournamentSchema.method("dto", function() {
  const { _id, __v, ...rest } = this.toObject();
  return { ...rest, id: _id };
});

export default mongoose.model("Tournament", tournamentSchema);
