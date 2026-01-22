/**
 * regionUtils.ts
 * 
 * Provides definitions for bit regions based on the decoding mode.
 * Used to highlight specific sections of the bit stream.
 * 
 * @author Mishat
 */
import { BitRegion, DecodeMode } from '../types';

/**
 * Returns the bit regions (ranges) relevant to the given decode mode.
 * @param decodeMode The current mode ('base', 'next', etc.).
 * @returns An array of BitRegion objects defining start/end indices and colors.
 */
export const getRegions = (decodeMode: DecodeMode): BitRegion[] => {
    if (decodeMode === 'base') {
        return [
            { start: 43, end: 47, color: 'bg-purple-500', label: 'FEC (F0-F4)' },
            { start: 21, end: 42, color: 'bg-blue-500', label: 'Tech Ability' },
            { start: 16, end: 20, color: 'bg-amber-500', label: 'Tx Nonce' },
            { start: 13, end: 15, color: 'bg-red-500', label: 'RF / ACK / NP' },
            { start: 10, end: 12, color: 'bg-emerald-500', label: 'Pause/Rsrv' },
            { start: 5, end: 9, color: 'bg-amber-500', label: 'Echo Nonce' },
            { start: 0, end: 4, color: 'bg-slate-500', label: 'Selector' },
        ];
    }
    if (decodeMode === 'next') {
        return [
            { start: 13, end: 15, color: 'bg-red-500', label: 'Flags (NP/ACK/MP)' },
            { start: 11, end: 12, color: 'bg-orange-500', label: 'T / ACK2' },
            { start: 0, end: 10, color: 'bg-blue-500', label: 'Message/Unformatted Code' },
            { start: 16, end: 47, color: 'bg-slate-500', label: 'Unformatted Data' },
        ]
    }
    return [];
};
