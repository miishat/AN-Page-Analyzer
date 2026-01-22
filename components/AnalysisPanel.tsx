import React, { useState } from 'react';
import { GoogleGenAI } from "@google/genai";
import { Sparkles, Loader2, AlertCircle } from 'lucide-react';

interface AnalysisPanelProps {
    hex: string;
    binary: string;
}

const AnalysisPanel: React.FC<AnalysisPanelProps> = ({ hex, binary }) => {
    const [loading, setLoading] = useState(false);
    const [analysis, setAnalysis] = useState<string | null>(null);
    const [error, setError] = useState<string | null>(null);
    const [lastAnalyzedHex, setLastAnalyzedHex] = useState<string>('');

    const handleAnalyze = async () => {
        if (!process.env.API_KEY) {
            setError("API Key is missing. Please set the API_KEY environment variable.");
            return;
        }

        if (hex === lastAnalyzedHex && analysis) return; // Cache simple check

        setLoading(true);
        setError(null);
        setAnalysis(null);

        try {
            const ai = new GoogleGenAI({ apiKey: process.env.API_KEY });
            const prompt = `
        I have a hexadecimal number: 0x${hex}
        Binary representation: ${binary}
        
        Does this number represent anything significant in computer science, software engineering, color codes, common magic numbers, or bit-flags? 
        If it seems random, just describe its magnitude and properties (e.g. is the MSB set? Is it odd/even?).
        Keep the answer concise (max 3 sentences) and interesting for a developer.
      `;

            const response = await ai.models.generateContent({
                model: 'gemini-3-flash-preview',
                contents: prompt,
            });

            setAnalysis(response.text || "No insights found.");
            setLastAnalyzedHex(hex);
        } catch (err: any) {
            console.error(err);
            setError("Failed to fetch AI analysis. " + (err.message || ""));
        } finally {
            setLoading(false);
        }
    };

    if (!hex) return null;

    return (
        <div className="mt-8 pt-6 border-t border-slate-200 dark:border-slate-800">
            <div className="flex items-center justify-between mb-4">
                <h3 className="text-lg font-semibold text-slate-800 dark:text-slate-200 flex items-center gap-2">
                    <Sparkles className="w-5 h-5 text-indigo-500" />
                    AI Insight
                </h3>
                {!analysis && !loading && (
                    <button
                        onClick={handleAnalyze}
                        className="px-4 py-2 bg-indigo-600 hover:bg-indigo-700 text-white text-sm font-medium rounded-lg transition-colors flex items-center gap-2 shadow-sm"
                    >
                        <Sparkles className="w-4 h-4" />
                        Analyze Pattern
                    </button>
                )}
            </div>

            {loading && (
                <div className="flex items-center gap-3 text-slate-500 text-sm animate-pulse">
                    <Loader2 className="w-4 h-4 animate-spin" />
                    Consulting Gemini...
                </div>
            )}

            {error && (
                <div className="p-4 bg-red-50 dark:bg-red-900/20 text-red-600 dark:text-red-400 text-sm rounded-lg flex items-start gap-3">
                    <AlertCircle className="w-5 h-5 shrink-0" />
                    {error}
                </div>
            )}

            {analysis && (
                <div className="bg-indigo-50 dark:bg-indigo-900/10 border border-indigo-100 dark:border-indigo-900/30 rounded-xl p-5">
                    <p className="text-slate-700 dark:text-slate-300 leading-relaxed">
                        {analysis}
                    </p>
                    <button
                        onClick={handleAnalyze}
                        className="mt-3 text-xs text-indigo-600 dark:text-indigo-400 font-medium hover:underline"
                    >
                        Regenerate
                    </button>
                </div>
            )}
        </div>
    );
};

export default AnalysisPanel;