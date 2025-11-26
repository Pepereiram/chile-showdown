import mongoose, { Schema } from 'mongoose';

interface ITeam {
  userId: mongoose.Types.ObjectId;
  name: string;
}

const teamSchema = new Schema<ITeam>(
  {
    userId: { type: Schema.Types.ObjectId, ref: 'User', required: true },
    name: { type: String, required: true, trim: true },
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

const Team = mongoose.model("ChilemonTeam", teamSchema);
export default Team;