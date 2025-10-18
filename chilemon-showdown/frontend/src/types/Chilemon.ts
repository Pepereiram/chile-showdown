interface Ability {
    name: string;
    is_hidden: boolean;
    slot: number;
}

interface Stat {
    name: string;
    base_value: number;
    // effort: number; Movi effort a TeamChilemon
}

interface Type {
    type: string;
    slot: number;
}

export interface Chilemon {
    id: number;
    name: string;
    abilities: Ability[];
    height: number;
    weight: number;
    moves: number[];
    stats: Stat[];
    types: Type[];
}