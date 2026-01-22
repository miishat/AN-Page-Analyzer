import React from 'react';
import BitGrid from './BitGrid';
import { BitRegion } from '../types';

interface BitVisualizerProps {
    currentVal1: string;
    currentVal2: string;
    isCompareMode: boolean;
    decodeMode: string;
    getRegions: () => BitRegion[];
}

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
