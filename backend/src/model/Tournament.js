import mongoose from "mongoose";

const tournamentSchema = mongoose.Schema({
  name: String,
  players: [String],
  states: [
    {
      state: Object,
      metadata: Object
    }
  ],
  options: {
    sizes: [Number],
    advancers: [Number]
  },
  activeMatchId: Object
});

tournamentSchema.method("dto", function() {
  // eslint-disable-next-line no-unused-vars
  const { _id, __v, ...rest } = this.toObject();
  return { ...rest, id: _id };
});

export default mongoose.model("Tournament", tournamentSchema);
