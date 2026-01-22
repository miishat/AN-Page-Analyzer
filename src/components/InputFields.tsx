/**
 * InputFields.tsx
 * 
 * Renders the primary text input fields for hexadecimal data.
 * Supports one or two inputs based on comparison mode.
 * 
 * @author Mishat
 */
import React from 'react';
import { DecodeMode } from '../types';

/**
 * Props for the InputFields component.
 */
interface InputFieldsProps {
    /** Content of the first input box. */
    currentVal1: string;
    /** Content of the second input box. */
    currentVal2: string;
    /** Whether comparison mode is active. */
    isCompareMode: boolean;
    /** Current decoding mode (affects placeholders). */
    decodeMode: DecodeMode;
    /** Callback when input changes. */
    handleInputChange: (val: string, box: 'box1' | 'box2') => void;
}

/**
 * Component providing text inputs for the user to enter hex strings.
 */
const InputFields: React.FC<InputFieldsProps> = ({
    currentVal1,
    currentVal2,
    isCompareMode,
    decodeMode,
    handleInputChange
}) => {
    const onWrappedChange = (e: React.ChangeEvent<HTMLInputElement>, box: 'box1' | 'box2') => {
        handleInputChange(e.target.value, box);
    };

    return (
        <div className={`grid gap-6 ${isCompareMode ? 'grid-cols-1 lg:grid-cols-2' : 'grid-cols-1'}`}>
            {/* Input 1 */}
            <div className="relative group">
                <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none">
                    <span className="text-slate-400 font-mono text-xl font-bold">0x</span>
                </div>
                <input
                    type="text"
                    value={currentVal1}
                    onChange={(e) => onWrappedChange(e, 'box1')}
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
                        value={currentVal2}
                        onChange={(e) => onWrappedChange(e, 'box2')}
                        placeholder="Page to compare..."
                        className="block w-full pl-12 pr-12 py-4 bg-slate-100 dark:bg-slate-950 border-2 border-transparent focus:border-amber-500 rounded-xl text-2xl font-mono tracking-wider text-slate-900 dark:text-white placeholder:text-slate-400 outline-none transition-all shadow-inner"
                        spellCheck={false}
                    />
                    <div className="absolute top-0 right-0 -mt-3 mr-4 bg-amber-100 dark:bg-amber-900/50 text-xs px-2 py-1 rounded text-amber-600 dark:text-amber-400 font-semibold uppercase tracking-wider">Input 2</div>
                </div>
            )}
        </div>
    );
};

export default InputFields;
