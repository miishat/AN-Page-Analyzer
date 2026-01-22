import React from 'react';
import { Info } from 'lucide-react';
import { hexCharToBinary } from '../utils/bitUtils';
import { BitRegion } from '../types';

interface BitGridProps {
    hexString: string;
    regions?: BitRegion[];
    isCompressed?: boolean;
}

const BitGrid: React.FC<BitGridProps> = ({ hexString, regions = [], isCompressed = false }) => {
    if (!hexString) {
        return (
            <div className="flex flex-col items-center justify-center py-12 text-slate-400 opacity-50">
                <Info className="w-12 h-12 mb-4 stroke-1" />
                <p className="text-lg">Waiting for input...</p>
            </div>
        );
    }

    const cleanHex = hexString.replace(/[^0-9A-Fa-f]/g, '');
    const totalBits = cleanHex.length * 4;

    const getRegionForBit = (index: number) => {
        return regions.find(r => index >= r.start && index <= r.end);
    };

    // Grid Logic:
    // Default (Full Width):
    // - 2 cols (Mobile)
    // - 3 cols (XS/SM)
    // - 4 cols (MD/Tablet) -> 16 bits/row
    // - 6 cols (LG/Desktop) -> 24 bits/row

    // Compressed (Split View on XL+):
    // - Inherits up to LG.
    // - At XL (Split happens): Container shrinks to ~600px.
    //   Force grid-cols-3 (12 bits) or grid-cols-4 (16 bits).
    //   grid-cols-6 (24 bits) is too wide for 600px.

    const gridClasses = isCompressed
        ? "grid grid-cols-2 min-[480px]:grid-cols-3 sm:grid-cols-4 lg:grid-cols-6 xl:grid-cols-3 2xl:grid-cols-4 gap-y-8 gap-x-2 place-items-center"
        : "grid grid-cols-2 min-[480px]:grid-cols-3 sm:grid-cols-4 lg:grid-cols-6 gap-y-8 gap-x-4 place-items-center";

    return (
        <div className="w-full">
            <div className={gridClasses}>
                {cleanHex.split('').map((char, charIdx) => {
                    const binary = hexCharToBinary(char);

                    return (
                        <div key={charIdx} className="flex flex-col items-center w-full">
                            {/* Hex Header */}
                            <div className="text-center mb-2">
                                <span className="text-xl sm:text-2xl font-bold text-slate-300 dark:text-slate-700 font-mono">
                                    {char.toUpperCase()}
                                </span>
                            </div>

                            {/* Bits Container */}
                            <div className="flex gap-1 justify-center">
                                {binary.split('').map((bit, bitIdx) => {
                                    const isOn = bit === '1';
                                    const absIndex = totalBits - (charIdx * 4) - bitIdx - 1;
                                    const region = getRegionForBit(absIndex);

                                    // Dynamic coloring
                                    let bgClass = isOn
                                        ? 'bg-emerald-500 text-white border-emerald-600 shadow-emerald-500/30'
                                        : 'bg-slate-100 dark:bg-slate-800/50 text-slate-300 dark:text-slate-600 border-slate-200 dark:border-slate-700';

                                    if (region) {
                                        if (isOn) {
                                            bgClass = `${region.color} text-white shadow-md border-transparent ring-1 ring-white/20`;
                                        } else {
                                            bgClass = `bg-slate-50 dark:bg-slate-900 text-slate-300 dark:text-slate-700 border-slate-200 dark:border-slate-800 relative`;
                                        }
                                    }

                                    return (
                                        <div key={bitIdx} className="flex flex-col items-center gap-1 group relative flex-shrink-0">
                                            {/* The Bit Box */}
                                            <div
                                                className={`
                          flex items-center justify-center rounded-md font-bold shadow-sm transition-all duration-200 border
                          ${bgClass}
                          /* Sizing: Slightly more compact to prevent overflow in split views */
                          w-6 h-8 text-sm
                          sm:w-7 sm:h-9 sm:text-base
                          md:w-8 md:h-10
                        `}
                                            >
                                                {bit}
                                                {/* Indicator dot for region on OFF bits */}
                                                {!isOn && region && (
                                                    <div className={`absolute top-1 right-1 w-1 h-1 rounded-full ${region.color.replace('bg-', 'bg-opacity-50 bg-')}`} />
                                                )}
                                            </div>

                                            {/* The Index Number */}
                                            <div className={`
                        text-[9px] sm:text-[10px] font-mono font-medium
                        ${isOn ? 'text-slate-900 dark:text-white' : 'text-slate-400 dark:text-slate-500'}
                      `}>
                                                {absIndex}
                                            </div>

                                            {/* Tooltip for Region */}
                                            {region && (
                                                <div className="absolute bottom-full mb-1 hidden group-hover:flex flex-col items-center z-20 pointer-events-none w-max max-w-[150px]">
                                                    <div className="bg-slate-900 text-slate-50 text-[10px] rounded px-2 py-1 text-center shadow-xl break-words">
                                                        <span className="font-semibold">{region.label}</span>
                                                    </div>
                                                    <div className="w-0 h-0 border-l-[4px] border-l-transparent border-r-[4px] border-r-transparent border-t-[4px] border-t-slate-900"></div>
                                                </div>
                                            )}
                                        </div>
                                    );
                                })}
                            </div>
                        </div>
                    );
                })}
            </div>
        </div>
    );
};

export default BitGrid;