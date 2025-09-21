interface Ability {
    name: string;
    description: string;
    slot: number;
}

interface Stat {
    name: string;
    base_value: number;
    effort: number;
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