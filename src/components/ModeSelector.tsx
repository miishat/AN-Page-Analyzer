/**
 * ModeSelector.tsx
 * 
 * Component for switching between 'Raw', 'Base Page', and 'Next Page' modes.
 * 
 * @author Mishat
 */
import React from 'react';
import { Terminal, Network, FileCode } from 'lucide-react';
import { DecodeMode } from '../types';

/**
 * Props for the ModeSelector component.
 */
interface ModeSelectorProps {
    /** The currently selected decoding mode. */
    decodeMode: DecodeMode;
    /** Callback to change the decoding mode. */
    setDecodeMode: (mode: DecodeMode) => void;
    /** Callback to reset comparison mode when switching main modes. */
    onResetCompare: () => void;
}

/**
 * A toggle group for selecting the application's analysis mode.
 */
const ModeSelector: React.FC<ModeSelectorProps> = ({ decodeMode, setDecodeMode, onResetCompare }) => {
    return (
        <div className="bg-slate-200 dark:bg-slate-900 p-1 rounded-lg flex items-center">
            <button
                onClick={() => { setDecodeMode('raw'); onResetCompare(); }}
                className={`px-3 py-1.5 rounded-md text-sm font-medium transition-all flex items-center gap-2 ${decodeMode === 'raw' ? 'bg-white dark:bg-slate-800 shadow-sm text-slate-900 dark:text-white' : 'text-slate-500 hover:text-slate-700 dark:hover:text-slate-300'}`}
            >
                <Terminal className="w-4 h-4" />
                <span className="hidden sm:inline">Raw Bits</span>
            </button>
            <button
                onClick={() => setDecodeMode('base')}
                className={`px-3 py-1.5 rounded-md text-sm font-medium transition-all flex items-center gap-2 ${decodeMode === 'base' ? 'bg-white dark:bg-slate-800 shadow-sm text-blue-600 dark:text-blue-400' : 'text-slate-500 hover:text-slate-700 dark:hover:text-slate-300'}`}
            >
                <Network className="w-4 h-4" />
                <span className="hidden sm:inline">Base Page</span>
            </button>
            <button
                onClick={() => setDecodeMode('next')}
                className={`px-3 py-1.5 rounded-md text-sm font-medium transition-all flex items-center gap-2 ${decodeMode === 'next' ? 'bg-white dark:bg-slate-800 shadow-sm text-indigo-600 dark:text-indigo-400' : 'text-slate-500 hover:text-slate-700 dark:hover:text-slate-300'}`}
            >
                <FileCode className="w-4 h-4" />
                <span className="hidden sm:inline">Next Page</span>
            </button>
        </div>
    );
};

export default ModeSelector;
