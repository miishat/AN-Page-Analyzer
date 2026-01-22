import React, { useState, useEffect } from 'react';
import { Terminal, Copy, Trash2, Moon, Sun, Cpu, Network, Settings2, FileCode, ArrowLeftRight } from 'lucide-react';
import { hexToBinary } from './utils/bitUtils';
import BitGrid, { BitRegion } from './components/BitGrid';
import EthernetDecoder from './components/EthernetDecoder';

type DecodeMode = 'raw' | 'base' | 'next';

const App: React.FC = () => {
    const [hexInput, setHexInput] = useState('');
    const [hexInput2, setHexInput2] = useState('');
    const [isCompareMode, setIsCompareMode] = useState(false);
    const [decodeMode, setDecodeMode] = useState<DecodeMode>('raw');
    const [darkMode, setDarkMode] = useState(true);

    // Handle dark mode toggle
    useEffect(() => {
        if (darkMode) {
            document.documentElement.classList.add('dark');
        } else {
            document.documentElement.classList.remove('dark');
        }
    }, [darkMode]);

    const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>, setter: (v: string) => void) => {
        // Only allow Hex characters
        const val = e.target.value;
        if (/^[0-9a-fA-F]*$/.test(val)) {
            setter(val.toUpperCase());
        }
    };

    const toggleCompare = () => {
        if (isCompareMode) {
            setIsCompareMode(false);
            setHexInput2('');
        } else {
            setIsCompareMode(true);
            if (decodeMode === 'raw') setDecodeMode('base'); // Compare implies structure usually
        }
    }

    // Define regions based on mode for visual highlighting
    const getRegions = (): BitRegion[] => {
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

    return (
        <div className="min-h-screen p-4 sm:p-8 font-sans bg-slate-50 dark:bg-slate-950 text-slate-900 dark:text-slate-100 transition-colors duration-200 selection:bg-emerald-500/30">

            {/* Header */}
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
                    <div className="bg-slate-200 dark:bg-slate-900 p-1 rounded-lg flex items-center">
                        <button
                            onClick={() => { setDecodeMode('raw'); setIsCompareMode(false); }}
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

            <main className="max-w-7xl mx-auto space-y-8">

                {/* Input Section */}
                <div className="bg-white dark:bg-slate-900 rounded-2xl p-6 shadow-sm border border-slate-200 dark:border-slate-800">

                    <div className={`grid gap-6 ${isCompareMode ? 'grid-cols-1 lg:grid-cols-2' : 'grid-cols-1'}`}>
                        {/* Input 1 */}
                        <div className="relative group">
                            <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none">
                                <span className="text-slate-400 font-mono text-xl font-bold">0x</span>
                            </div>
                            <input
                                type="text"
                                value={hexInput}
                                onChange={(e) => handleInputChange(e, setHexInput)}
                                placeholder={decodeMode === 'raw' ? "Type Hex..." : "48-bit AN Page Hex..."}
                                className="block w-full pl-12 pr-12 py-4 bg-slate-100 dark:bg-slate-950 border-2 border-transparent focus:border-emerald-500 rounded-xl text-2xl font-mono tracking-wider text-slate-900 dark:text-white placeholder:text-slate-400 outline-none transition-all shadow-inner"
                                autoFocus
                                spellCheck={false}
                            />
                            {isCompareMode && <div className="absolute top-0 right-0 -mt-3 mr-4 bg-slate-200 dark:bg-slate-800 text-xs px-2 py-1 rounded text-slate-500 font-semibold uppercase tracking-wider">Input 1</div>}
                        </div>

                        {/* Input 2 (Compare Mode) */}
                        {isCompareMode && (
                            <div className="relative group animate-in fade-in slide-in-from-right-4">
                                <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none">
                                    <span className="text-slate-400 font-mono text-xl font-bold">0x</span>
                                </div>
                                <input
                                    type="text"
                                    value={hexInput2}
                                    onChange={(e) => handleInputChange(e, setHexInput2)}
                                    placeholder="Page to compare..."
                                    className="block w-full pl-12 pr-12 py-4 bg-slate-100 dark:bg-slate-950 border-2 border-transparent focus:border-amber-500 rounded-xl text-2xl font-mono tracking-wider text-slate-900 dark:text-white placeholder:text-slate-400 outline-none transition-all shadow-inner"
                                    spellCheck={false}
                                />
                                <div className="absolute top-0 right-0 -mt-3 mr-4 bg-amber-100 dark:bg-amber-900/50 text-xs px-2 py-1 rounded text-amber-600 dark:text-amber-400 font-semibold uppercase tracking-wider">Input 2</div>
                            </div>
                        )}
                    </div>

                    {/* Mode-Specific Stats or Quick Actions */}
                    <div className="flex flex-wrap justify-center gap-6 mt-8 mb-4 text-sm">
                        <div className="flex items-center gap-2 px-4 py-2 bg-slate-50 dark:bg-slate-800/50 rounded-lg border border-slate-100 dark:border-slate-800">
                            <span className="text-slate-500 uppercase tracking-wider font-semibold text-xs">Bits</span>
                            <span className="font-mono">{Math.max(hexInput.length * 4, decodeMode !== 'raw' ? 48 : 0)}</span>
                        </div>
                        {decodeMode !== 'raw' && (
                            <div className="flex items-center gap-2 px-4 py-2 bg-indigo-50 dark:bg-indigo-900/20 text-indigo-700 dark:text-indigo-300 rounded-lg border border-indigo-100 dark:border-indigo-800">
                                <Settings2 className="w-3.5 h-3.5" />
                                <span className="text-xs font-semibold">IEEE 802.3 Clause 73 Mode</span>
                            </div>
                        )}
                    </div>

                    {/* The Bit Grids */}
                    <div className="border-t border-slate-100 dark:border-slate-800 pt-8">
                        <div className={`grid gap-8 ${isCompareMode ? 'grid-cols-1 xl:grid-cols-2' : 'grid-cols-1'}`}>
                            <div>
                                {isCompareMode && <h3 className="text-xs font-semibold text-slate-400 uppercase tracking-wider mb-4">Bit Visualizer 1</h3>}
                                <BitGrid
                                    hexString={decodeMode !== 'raw' && hexInput ? hexInput.padStart(12, '0') : hexInput}
                                    regions={getRegions()}
                                    isCompressed={isCompareMode}
                                />
                            </div>
                            {isCompareMode && hexInput2 && (
                                <div className="border-t xl:border-t-0 xl:border-l border-slate-100 dark:border-slate-800 pt-8 xl:pt-0 xl:pl-8">
                                    <h3 className="text-xs font-semibold text-amber-500 uppercase tracking-wider mb-4">Bit Visualizer 2</h3>
                                    <BitGrid
                                        hexString={decodeMode !== 'raw' && hexInput2 ? hexInput2.padStart(12, '0') : hexInput2}
                                        regions={getRegions()}
                                        isCompressed={isCompareMode}
                                    />
                                </div>
                            )}
                        </div>
                    </div>

                    {/* The Decoder Panel (Conditional) */}
                    {hexInput && decodeMode !== 'raw' && (
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
                                hexString={hexInput}
                                hexString2={isCompareMode ? hexInput2 : undefined}
                                mode={decodeMode}
                            />
                        </div>
                    )}

                    {!hexInput && !isCompareMode && (
                        <div className="mt-8 text-center">
                            <div className="flex justify-center gap-2">
                                {decodeMode === 'raw' ? (
                                    ['1F', 'A5', 'DEADBEEF', 'C0FFEE'].map(example => (
                                        <button
                                            key={example}
                                            onClick={() => setHexInput(example)}
                                            className="px-3 py-1 bg-slate-100 dark:bg-slate-800 hover:bg-slate-200 dark:hover:bg-slate-700 rounded-full text-xs font-mono text-slate-600 dark:text-slate-300 transition-colors"
                                        >
                                            0x{example}
                                        </button>
                                    ))
                                ) : (
                                    ['01E00000', '41A00001', 'C00000200001'].map(example => (
                                        <button
                                            key={example}
                                            onClick={() => setHexInput(example)}
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