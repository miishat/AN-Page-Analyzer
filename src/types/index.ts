export type DecodeMode = 'raw' | 'base' | 'next';

export interface InputState {
    raw: { box1: string; box2: string };
    base: { box1: string; box2: string };
    next: { box1: string; box2: string };
}

export interface BitRegion {
    start: number;
    end: number;
    color: string;
    label: string;
}
