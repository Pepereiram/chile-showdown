import mongoose, { Schema } from 'mongoose';

interface Ability {
    name: string;
    is_hidden: boolean;
    slot: number;
}

export interface Stat {
    name: string;
    base_value: number;
}

interface Type {
    type: string;
    slot: number;
}

export interface IChilemon {
    id: number; // ID especie
    name: string;
    abilities: Ability[];
    height: number;
    weight: number;
    moves: number[];
    stats: Stat[];
    types: Type[]
}

const abilitySchema = new Schema<Ability>(
    {
        name: {type: String, required: true},
        is_hidden: {type: Boolean, required: true},
        slot: {type: Number, required: true}
    },
        {_id: false }
)

const typeSchema = new Schema<Type>(
    {
        type: {type: String, required: true},
        slot: {type: Number, required: true}
    },
        {_id: false }
)

const statSchema = new Schema<Stat>(
    {
        name: {type: String, required: true},
        base_value: {type: Number, required: true}
    },
        {_id: false }
)

const chilemonSchema = new Schema<IChilemon>(
    {
        id: {type: Number, required: true, unique: true},
        name: {type: String, required: true},
        abilities: {type: [abilitySchema], required: true, default: []},
        height: {type: Number, required: true},
        weight: {type: Number, required: true},
        moves: {type: [Number], required: true, default: []},
        stats: {type: [statSchema], required: true, default: []},
        types: {type: [typeSchema], required: true, default: []},
    }
)   

const Chilemon = mongoose.model("Chilemon", chilemonSchema);
export default Chilemon;