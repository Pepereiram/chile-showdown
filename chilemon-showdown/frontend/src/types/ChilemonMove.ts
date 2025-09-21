export interface ChilemonMove {
    id: number;
    name: string;
    damage_class: string;
    power: number | null;
    pp: number;
    priority: number;
    stat_changes: {
        stat: string;
        change: number;
    }[]
    target: string;
    type: string;
    ailment: string;
    effect_entry: string;
}