/**
 * BitVisualizer.tsx
 * 
 * Container component for rendering one or two BitGrid instances.
 * Handles the logic for comparison mode and layout wrappers.
 * 
 * @author Mishat
 */
import React from 'react';
import BitGrid from './BitGrid';
import { BitRegion } from '../types';

/**
 * Props for the BitVisualizer component.
 */
interface BitVisualizerProps {
    /** The hex value for the first input box. */
    currentVal1: string;
    /** The hex value for the second input box (used in compare mode). */
    currentVal2: string;
    /** Whether comparison mode is active. */
    isCompareMode: boolean;
    /** The current decoding mode (raw, base, etc.). */
    decodeMode: string;
    /** Function to retrieve the relevant bit regions for the current mode. */
    getRegions: () => BitRegion[];
}

/**
 * Visualizes the bits for the inputs. Supports single or dual (compare) view.
 */
const BitVisualizer: React.FC<BitVisualizerProps> = ({
    currentVal1,
    currentVal2,
    isCompareMode,
    decodeMode,
    getRegions
}) => {
    return (
        <div className="border-t border-slate-100 dark:border-slate-800 pt-8">
            <div className={`grid gap-8 ${isCompareMode ? 'grid-cols-1 xl:grid-cols-2' : 'grid-cols-1'}`}>
                <div>
                    {isCompareMode && <h3 className="text-xs font-semibold text-slate-400 uppercase tracking-wider mb-4">Bit Visualizer 1</h3>}
                    <BitGrid
                        hexString={decodeMode !== 'raw' && currentVal1 ? currentVal1.padStart(12, '0') : currentVal1}
                        regions={getRegions()}
                        isCompressed={isCompareMode}
                    />
                </div>
                {isCompareMode && currentVal2 && (
                    <div className="border-t xl:border-t-0 xl:border-l border-slate-100 dark:border-slate-800 pt-8 xl:pt-0 xl:pl-8">
                        <h3 className="text-xs font-semibold text-amber-500 uppercase tracking-wider mb-4">Bit Visualizer 2</h3>
                        <BitGrid
                            hexString={decodeMode !== 'raw' && currentVal2 ? currentVal2.padStart(12, '0') : currentVal2}
                            regions={getRegions()}
                            isCompressed={isCompareMode}
                        />
                    </div>
                )}
            </div>
        </div>
    );
};

export default BitVisualizer;
