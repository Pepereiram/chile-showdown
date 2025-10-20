import mongoose, { Schema } from 'mongoose';

interface ITeamChilemon {
  teamId: mongoose.Types.ObjectId;
  pokemonId: number;
  position: number;
  nickname: string;
  level: number;
  moves: number[];
  effort: number[];
}

const teamChilemonSchema = new Schema<ITeamChilemon>(
  {
    teamId: { type: Schema.Types.ObjectId, ref: 'Team', required: true },
    pokemonId: { type: Number, required: true },
    position: { type: Number, required: true },
    nickname: { type: String, required: true, trim: true },
    level: { type: Number, default: 100 },
    moves: { type: [Number], default: [] },
    effort: { type: [Number], default: [] },
  },
  {
    timestamps: true,
    toJSON: {
      transform(_doc, ret: Record<string, any>) {
        ret.id = ret._id.toString();
        delete ret._id;
        delete ret.__v;
      },
    },
  }
);

const TeamChilemon = mongoose.model("TeamChilemon", teamChilemonSchema);
export default TeamChilemon;