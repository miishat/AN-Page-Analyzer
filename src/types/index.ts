/**
 * index.ts
 * 
 * Shared type definitions for the application.
 * 
 * @author Mishat
 */

/**
 * Supported decoding modes:
 * - 'raw': View bits without specific page parsing.
 * - 'base': Parse as an Ethernet Base Page.
 * - 'next': Parse as an Ethernet Next Page.
 */
export type DecodeMode = 'raw' | 'base' | 'next';

/**
 * State structure holding input values for all modes.
 */
export interface InputState {
    raw: { box1: string; box2: string };
    base: { box1: string; box2: string };
    next: { box1: string; box2: string };
}

/**
 * Represents a region of bits with a specific semantic meaning.
 */
export interface BitRegion {
    start: number;
    end: number;
    color: string;
    label: string;
}
