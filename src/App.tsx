/**
 * App.tsx
 * 
 * Main application component.
 * Manages global state, layout, and composition of sub-components.
 * 
 * @author Mishat
 */
import React, { useState, useEffect } from 'react';
import { Settings2, Network } from 'lucide-react';

import EthernetDecoder from './components/EthernetDecoder';
import Header from './components/Header';
import InputFields from './components/InputFields';
import BitVisualizer from './components/BitVisualizer';
import { useInputState } from './hooks/useInputState';
import { getRegions } from './utils/regionUtils';

/**
 * Role:
 * - Coordinates state between Header, InputFields, and Visualizers.
 * - Manages Dark Mode and Comparison Mode toggles.
 * - Renders the main layout.
 */
const App: React.FC = () => {
    // Custom hook for input state management
    const {
        inputs,
        decodeMode,
        setDecodeMode,
        handleInputChange,
        setInputDirectly
    } = useInputState();

    const [isCompareMode, setIsCompareMode] = useState(false);
    const [darkMode, setDarkMode] = useState(true);

    // Helpers to get current active inputs
    const currentVal1 = inputs[decodeMode].box1;
    const currentVal2 = inputs[decodeMode].box2;

    // Handle dark mode toggle
    useEffect(() => {
        if (darkMode) {
            document.documentElement.classList.add('dark');
        } else {
            document.documentElement.classList.remove('dark');
        }
    }, [darkMode]);

    const toggleCompare = () => {
        if (isCompareMode) {
            setIsCompareMode(false);
        } else {
            setIsCompareMode(true);
            if (decodeMode === 'raw') setDecodeMode('base');
        }
    }

    return (
        <div className="min-h-screen p-4 sm:p-8 font-sans bg-slate-50 dark:bg-slate-950 text-slate-900 dark:text-slate-100 transition-colors duration-200 selection:bg-emerald-500/30">

            {/* Header */}
            <Header
                decodeMode={decodeMode}
                setDecodeMode={setDecodeMode}
                isCompareMode={isCompareMode}
                toggleCompare={toggleCompare}
                darkMode={darkMode}
                setDarkMode={setDarkMode}
                setIsCompareMode={setIsCompareMode}
            />

            <main className="max-w-7xl mx-auto space-y-8">

                {/* Input Section */}
                <div className="bg-white dark:bg-slate-900 rounded-2xl p-6 shadow-sm border border-slate-200 dark:border-slate-800">

                    <InputFields
                        currentVal1={currentVal1}
                        currentVal2={currentVal2}
                        isCompareMode={isCompareMode}
                        decodeMode={decodeMode}
                        handleInputChange={handleInputChange}
                    />

                    {/* Mode-Specific Stats or Quick Actions */}
                    <div className="flex flex-wrap justify-center gap-6 mt-8 mb-4 text-sm">
                        <div className="flex items-center gap-2 px-4 py-2 bg-slate-50 dark:bg-slate-800/50 rounded-lg border border-slate-100 dark:border-slate-800">
                            <span className="text-slate-500 uppercase tracking-wider font-semibold text-xs">Bits</span>
                            <span className="font-mono">{Math.max(currentVal1.length * 4, decodeMode !== 'raw' ? 48 : 0)}</span>
                        </div>
                        {decodeMode !== 'raw' && (
                            <div className="flex items-center gap-2 px-4 py-2 bg-indigo-50 dark:bg-indigo-900/20 text-indigo-700 dark:text-indigo-300 rounded-lg border border-indigo-100 dark:border-indigo-800">
                                <Settings2 className="w-3.5 h-3.5" />
                                <span className="text-xs font-semibold">IEEE 802.3 Clause 73 Mode</span>
                            </div>
                        )}
                    </div>

                    {/* The Bit Visualizer */}
                    <BitVisualizer
                        currentVal1={currentVal1}
                        currentVal2={currentVal2}
                        isCompareMode={isCompareMode}
                        decodeMode={decodeMode}
                        getRegions={() => getRegions(decodeMode)}
                    />

                    {/* The Decoder Panel (Conditional) */}
                    {currentVal1 && decodeMode !== 'raw' && (
                        <div className="mt-8 pt-8 border-t border-slate-100 dark:border-slate-800">
                            <h2 className="text-lg font-semibold mb-6 flex items-center gap-2">
                                <Network className="w-5 h-5 text-emerald-500" />
                                {isCompareMode ? (
                                    <span>Comparing {decodeMode === 'base' ? 'Base Pages' : 'Next Pages'}</span>
                                ) : (
                                    <span>{decodeMode === 'base' ? 'Base Page Analysis' : 'Next Page Analysis'}</span>
                                )}
                            </h2>
                            <EthernetDecoder
                                hexString={currentVal1}
                                hexString2={isCompareMode ? currentVal2 : undefined}
                                mode={decodeMode}
                            />
                        </div>
                    )}

                    {!currentVal1 && !isCompareMode && (
                        <div className="mt-8 text-center">
                            <div className="flex justify-center gap-2">
                                {decodeMode === 'raw' ? (
                                    ['1F', 'A5', 'DEADBEEF', 'C0FFEE'].map(example => (
                                        <button
                                            key={example}
                                            onClick={() => setInputDirectly(example)}
                                            className="px-3 py-1 bg-slate-100 dark:bg-slate-800 hover:bg-slate-200 dark:hover:bg-slate-700 rounded-full text-xs font-mono text-slate-600 dark:text-slate-300 transition-colors"
                                        >
                                            0x{example}
                                        </button>
                                    ))
                                ) : (
                                    ['01E00000', '41A00001', 'C00000200001'].map(example => (
                                        <button
                                            key={example}
                                            onClick={() => setInputDirectly(example)}
                                            className="px-3 py-1 bg-slate-100 dark:bg-slate-800 hover:bg-slate-200 dark:hover:bg-slate-700 rounded-full text-xs font-mono text-slate-600 dark:text-slate-300 transition-colors"
                                        >
                                            0x{example}
                                        </button>
                                    ))
                                )}
                            </div>
                        </div>
                    )}

                </div>

            </main>
        </div>
    );
};

export default App;
