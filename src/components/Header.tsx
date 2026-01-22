/**
 * Header.tsx
 * 
 * Top navigation bar containing the app title, mode selector,
 * comparison toggle, and dark mode toggle.
 * 
 * @author Mishat
 */
import React from 'react';
import { Cpu, Sun, Moon, ArrowLeftRight } from 'lucide-react';
import { DecodeMode } from '../types';
import ModeSelector from './ModeSelector';

/**
 * Props for the Header component.
 */
interface HeaderProps {
    /** Current decoding mode state. */
    decodeMode: DecodeMode;
    /** Setter for decoding mode. */
    setDecodeMode: (mode: DecodeMode) => void;
    /** Whether comparison mode is active. */
    isCompareMode: boolean;
    /** Toggles comparison mode on/off. */
    toggleCompare: () => void;
    /** Whether dark mode is active. */
    darkMode: boolean;
    /** Setter for dark mode. */
    setDarkMode: (value: boolean) => void;
    /** Direct setter for comparison mode state. */
    setIsCompareMode: (value: boolean) => void;
}

/**
 * App header component.
 */
const Header: React.FC<HeaderProps> = ({
    decodeMode,
    setDecodeMode,
    isCompareMode,
    toggleCompare,
    darkMode,
    setDarkMode,
    setIsCompareMode
}) => {
    return (
        <header className="max-w-7xl mx-auto mb-8 flex flex-col md:flex-row justify-between items-center gap-4">
            <div className="flex items-center gap-3">
                <div className="p-2.5 bg-slate-900 dark:bg-white rounded-lg shadow-lg">
                    <Cpu className="w-6 h-6 text-white dark:text-slate-900" />
                </div>
                <div>
                    <h1 className="text-2xl font-bold tracking-tight">
                        AN Page Analyzer
                    </h1>
                </div>
            </div>

            <div className="flex flex-wrap items-center gap-4 justify-end">
                {/* Mode Selector */}
                <ModeSelector
                    decodeMode={decodeMode}
                    setDecodeMode={setDecodeMode}
                    onResetCompare={() => setIsCompareMode(false)}
                />

                {/* Compare Toggle (Only visible in decode modes) */}
                {decodeMode !== 'raw' && (
                    <button
                        onClick={toggleCompare}
                        className={`px-3 py-1.5 rounded-lg text-sm font-medium transition-all flex items-center gap-2 border ${isCompareMode ? 'bg-amber-100 dark:bg-amber-900/30 text-amber-700 dark:text-amber-400 border-amber-200 dark:border-amber-800' : 'bg-transparent border-slate-300 dark:border-slate-700 text-slate-500 hover:text-slate-700 dark:hover:text-slate-300'}`}
                    >
                        <ArrowLeftRight className="w-4 h-4" />
                        <span>Compare</span>
                    </button>
                )}

                <button
                    onClick={() => setDarkMode(!darkMode)}
                    className="p-2 rounded-full hover:bg-slate-200 dark:hover:bg-slate-800 transition-colors"
                    aria-label="Toggle theme"
                >
                    {darkMode ? <Sun className="w-5 h-5" /> : <Moon className="w-5 h-5" />}
                </button>
            </div>
        </header>
    );
};

export default Header;
