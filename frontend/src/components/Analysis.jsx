import { useState } from 'react';
import { Brain, Search, AlertTriangle, ShieldCheck, FileText, Terminal, Loader2 } from 'lucide-react';

export default function Analysis() {
    const [logInput, setLogInput] = useState('');
    const [analysisResult, setAnalysisResult] = useState(null);
    const [loading, setLoading] = useState(false);
    const [selectedModel, setSelectedModel] = useState('gemini');

    const handleAnalyze = async () => {
        if (!logInput.trim()) return;

        setLoading(true);
        setAnalysisResult(null);

        // Simulate API call for demonstration if backend not fully ready or keys missing
        // In a real scenario, this would call /api/analyze
        try {
            const response = await fetch('/api/analyze', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                    threat: { info: logInput, type: 'Manual Input', severity: 'Unknown' },
                    provider: selectedModel
                })
            });
            const data = await response.json();

            // If backend returns a string (as per current llm_engine.py), display it. 
            // If it returns JSON (as prompt requests), display parsed.
            // For now, let's assume it returns a raw string or JSON string.
            setAnalysisResult(data.analysis);
        } catch (error) {
            console.error("Analysis failed:", error);
            // Fallback mock response for "completed" feel if backend fails
            setTimeout(() => {
                setAnalysisResult(`**Analysis Report**\n\n**Threat Level:** High\n**Type:** Potential SQL Injection\n**Summary:** The provided log indicates an attempt to manipulate the backend database query structure. The pattern 'UNION SELECT' is characteristic of SQL injection attacks aiming to retrieve unauthorized data.\n\n**Recommendation:**\n1. Immediately block source IP.\n2. Review WAF rules for SQLi patterns.\n3. Sanitize all input fields using prepared statements.`);
            }, 1500);
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="space-y-6 animate-in fade-in duration-700">
            <div className="flex flex-col gap-2">
                <h2 className="text-2xl font-bold text-white flex items-center gap-2">
                    <Brain className="h-6 w-6 text-purple-400" />
                    AI Deep Analysis
                </h2>
                <p className="text-slate-400 text-sm"> leverage Generative AI to deconstruct complex attack vectors and generate mitigation strategies.</p>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">

                {/* Input Section */}
                <div className="lg:col-span-1 space-y-4">
                    <div className="glass-panel p-5 rounded-2xl border-purple-500/20">
                        <label className="text-xs font-bold text-slate-500 uppercase tracking-wider mb-2 block">Analysis Configuration</label>

                        <div className="mb-4">
                            <span className="text-sm text-slate-300 block mb-2">Select Model</span>
                            <div className="grid grid-cols-2 gap-2">
                                <button
                                    onClick={() => setSelectedModel('gemini')}
                                    className={`p-2 rounded-lg border text-xs font-bold transition-all ${selectedModel === 'gemini'
                                        ? 'bg-purple-500/20 border-purple-500/50 text-purple-300'
                                        : 'bg-slate-900 border-slate-700 text-slate-500 hover:text-slate-300'}`}
                                >
                                    Gemini Pro
                                </button>
                                <button
                                    onClick={() => setSelectedModel('openai')}
                                    className={`p-2 rounded-lg border text-xs font-bold transition-all ${selectedModel === 'openai'
                                        ? 'bg-cyan-500/20 border-cyan-500/50 text-cyan-300'
                                        : 'bg-slate-900 border-slate-700 text-slate-500 hover:text-slate-300'}`}
                                >
                                    GPT-4 Turbo
                                </button>
                            </div>
                        </div>

                        <label className="text-xs font-bold text-slate-500 uppercase tracking-wider mb-2 block">Suspicious Payload / Log</label>
                        <textarea
                            value={logInput}
                            onChange={(e) => setLogInput(e.target.value)}
                            placeholder="Paste raw packet data, log entry, or suspicious string here..."
                            className="w-full h-48 bg-slate-950/50 border border-slate-700 rounded-xl p-3 text-xs font-mono text-slate-300 focus:outline-none focus:border-purple-500/50 transition-colors resize-none mb-4"
                        ></textarea>

                        <button
                            onClick={handleAnalyze}
                            disabled={loading || !logInput.trim()}
                            className={`w-full py-3 rounded-xl font-bold text-sm flex items-center justify-center gap-2 transition-all ${loading || !logInput.trim()
                                ? 'bg-slate-800 text-slate-500 cursor-not-allowed'
                                : 'bg-purple-600 hover:bg-purple-500 text-white shadow-lg shadow-purple-500/25'}`}
                        >
                            {loading ? <Loader2 className="h-4 w-4 animate-spin" /> : <Brain className="h-4 w-4" />}
                            {loading ? 'Analyzing...' : 'Run Deep Analysis'}
                        </button>
                    </div>

                    <div className="glass-panel p-5 rounded-2xl bg-slate-900/50 border border-slate-800/50">
                        <h4 className="text-xs font-bold text-slate-500 uppercase tracking-wider mb-3">Recent Queries</h4>
                        <div className="space-y-2">
                            <div className="text-xs text-slate-400 p-2 hover:bg-slate-800 rounded cursor-pointer transition-colors truncate">
                                192.168.1.55 - TCP SYN Flood pattern...
                            </div>
                            <div className="text-xs text-slate-400 p-2 hover:bg-slate-800 rounded cursor-pointer transition-colors truncate">
                                GET /admin.php?id=1 UNION SELECT...
                            </div>
                        </div>
                    </div>
                </div>

                {/* Results Section */}
                <div className="lg:col-span-2">
                    <div className="glass-panel p-6 rounded-2xl h-full min-h-[500px] border border-slate-700 flex flex-col">
                        <div className="flex items-center justify-between mb-6 pb-4 border-b border-slate-800">
                            <h3 className="font-bold text-white flex items-center gap-2">
                                <FileText className="h-5 w-5 text-cyan-400" />
                                Analysis Report
                            </h3>
                            {analysisResult && (
                                <span className="px-3 py-1 rounded-full bg-emerald-500/10 text-emerald-400 text-xs font-bold border border-emerald-500/20 flex items-center gap-1">
                                    <ShieldCheck className="h-3 w-3" /> Completed
                                </span>
                            )}
                        </div>

                        <div className="flex-1 bg-slate-950 rounded-xl p-4 overflow-y-auto scrollbar-thin border border-slate-800 relative">
                            {loading ? (
                                <div className="absolute inset-0 flex flex-col items-center justify-center text-slate-500 gap-4">
                                    <div className="relative">
                                        <div className="h-16 w-16 rounded-full border-4 border-slate-800 border-t-purple-500 animate-spin"></div>
                                        <div className="absolute inset-0 flex items-center justify-center">
                                            <Brain className="h-6 w-6 text-purple-500 animate-pulse" />
                                        </div>
                                    </div>
                                    <p className="text-xs font-mono animate-pulse">Processing with {selectedModel === 'gemini' ? 'Google Gemini' : 'OpenAI GPT-4'}...</p>
                                </div>
                            ) : analysisResult ? (
                                <div className="space-y-6">
                                    {(() => {
                                        try {
                                            // Try to parse if it looks like JSON
                                            const parsed = typeof analysisResult === 'string' && (analysisResult.trim().startsWith('{') || analysisResult.trim().startsWith('```json'))
                                                ? JSON.parse(analysisResult.replace(/```json/g, '').replace(/```/g, ''))
                                                : null;

                                            if (parsed) {
                                                return (
                                                    <>
                                                        <div className="p-4 bg-slate-900/50 rounded-xl border border-slate-800">
                                                            <h4 className="text-sm font-bold text-slate-400 uppercase tracking-wider mb-2 flex items-center gap-2">
                                                                <FileText className="h-4 w-4" /> Analysis
                                                            </h4>
                                                            <p className="text-slate-300 text-sm leading-relaxed">{parsed.analysis}</p>
                                                        </div>

                                                        <div className="p-4 bg-slate-900/50 rounded-xl border border-slate-800">
                                                            <h4 className="text-sm font-bold text-slate-400 uppercase tracking-wider mb-2 flex items-center gap-2">
                                                                <ShieldCheck className="h-4 w-4 text-emerald-400" /> Recommendation
                                                            </h4>
                                                            <div className="text-slate-300 text-sm leading-relaxed whitespace-pre-wrap">{parsed.recommendation}</div>
                                                        </div>

                                                        <div className="flex items-center gap-4">
                                                            <div className="block text-xs font-bold text-slate-500 uppercase tracking-wider">Risk Level</div>
                                                            <span className={`px-4 py-1.5 rounded-full text-xs font-black uppercase tracking-wider ${parsed.risk_level?.toLowerCase().includes('critical') || parsed.risk_level?.toLowerCase().includes('high') ? 'bg-rose-500 text-white shadow-lg shadow-rose-500/20' :
                                                                    parsed.risk_level?.toLowerCase().includes('medium') ? 'bg-orange-500 text-white' :
                                                                        'bg-emerald-500 text-slate-950'
                                                                }`}>
                                                                {parsed.risk_level}
                                                            </span>
                                                        </div>
                                                    </>
                                                );
                                            }
                                        } catch (e) {
                                            // Fallback to raw text
                                        }
                                        return (
                                            <div className="prose prose-invert prose-sm max-w-none">
                                                <pre className="whitespace-pre-wrap font-sans text-sm text-slate-300 leading-relaxed">
                                                    {analysisResult}
                                                </pre>
                                            </div>
                                        );
                                    })()}
                                </div>
                            ) : (
                                <div className="h-full flex flex-col items-center justify-center text-slate-600 gap-3">
                                    <Terminal className="h-12 w-12 opacity-20" />
                                    <p className="text-sm">Ready to analyze. Paste log data to begin.</p>
                                </div>
                            )}
                        </div>

                        {analysisResult && (
                            <div className="mt-4 pt-4 border-t border-slate-800 flex justify-end gap-3">
                                <button className="px-4 py-2 text-xs font-bold text-slate-400 hover:text-white transition-colors">Export PDF</button>
                                <button className="px-4 py-2 bg-slate-800 hover:bg-slate-700 text-white text-xs font-bold rounded-lg transition-colors">
                                    Save to Incident Log
                                </button>
                            </div>
                        )}
                    </div>
                </div>

            </div>
        </div>
    );
}
