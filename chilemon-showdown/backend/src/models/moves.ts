import mongoose, { Schema } from 'mongoose';

interface StatChange {
    stat: string;
    change: number;
}

interface IMove {
    id: number;
    name: string;
    damage_class: string;
    power: number | null;
    pp: number;
    priority: number;
    stat_changes: StatChange[];
    target: string;
    type: string;
    ailment: string;
    effect_entry: string;
}

const statChangeSchema = new Schema<StatChange>(
    {
        stat: {type: String, required: true},
        change: {type: Number, required: true}
    }
)

const moveSchema = new Schema<IMove>(
    {
        id: {type: Number, required: true},
        name: {type: String, required: true},
        damage_class: {type: String, required: true},
        power: {type: Number || null} ,
        pp: {type: Number, required: true},
        priority: {type: Number, required: true},
        stat_changes: {type: [statChangeSchema], required: true, default: []},
        target: {type: String, required: true},
        type: {type: String, required: true},
        ailment: {type: String, required: true},
        effect_entry: {type: String, required: true}
    }
)

const Move = mongoose.model("Move", moveSchema);
export default Move;