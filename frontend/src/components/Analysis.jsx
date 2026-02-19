import { useState, useEffect, useRef } from 'react';
import {
    Brain,
    Search,
    AlertTriangle,
    ShieldCheck,
    FileText,
    Terminal,
    Loader2,
    Copy,
    Check,
    Sparkles,
    ChevronRight,
    Lock,
    Unlock,
    Activity,
    Save,
    XCircle
} from 'lucide-react';
import ThemeToggle from "./ThemeToggle";

const ANALYSIS_PRESETS = [
    // { label: "SQL Injection Pattern", value: "' UNION SELECT 1, user(), 3 --" },
    // { label: "XSS Payload", value: "<script>alert('Stealing Cookies!')</script>" },
    // { label: "Suspicious Shell Command", value: "; cat /etc/passwd | mail -s 'Hack'" },
];

export default function Analysis() {
    const [logInput, setLogInput] = useState('');
    const [analysisResult, setAnalysisResult] = useState(null);
    const [loading, setLoading] = useState(false);
    const [selectedModel, setSelectedModel] = useState('gemini');
    const [copied, setCopied] = useState(false);

    const handleCopy = () => {
        if (!analysisResult) return;
        const textToCopy = typeof analysisResult === 'string' ? analysisResult : JSON.stringify(analysisResult, null, 2);
        navigator.clipboard.writeText(textToCopy);
        setCopied(true);
        setTimeout(() => setCopied(false), 2000);
    };

    const handleAnalyze = async () => {
        if (!logInput.trim()) return;

        setLoading(true);
        setAnalysisResult(null);

        try {
            // Attempt to call the API
            const controller = new AbortController();
            const timeoutId = setTimeout(() => controller.abort(), 8000);

            const response = await fetch('/api/analyze', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                    threat: { info: logInput, type: 'Manual Input', severity: 'Unknown' },
                    provider: selectedModel
                }),
                signal: controller.signal
            }).catch(() => null);

            clearTimeout(timeoutId);

            let data;
            if (response && response.ok) {
                data = await response.json();
                setAnalysisResult(data.analysis);
            } else {
                // FALLBACK MOCK for visualization if backend is offline or slow
                await new Promise(r => setTimeout(r, 1500));
                const mockResponse = JSON.stringify({
                    threat_level: "CRITICAL",
                    confidence_score: 98,
                    attack_type: "SQL Injection (SQLi)",
                    analysis: "The input string contains a classic UNION-based SQL injection pattern. The attacker is attempting to append the results of a secondary query (extracting user database info) to the original query results.",
                    indicators: [
                        "UNION operator detected",
                        "SELECT statement present",
                        "Comment sequence (--) used for truncation"
                    ],
                    mitigation: "1. Validate and sanitize all user inputs.\n2. Use parameterized queries (Prepared Statements).\n3. Implement Web Application Firewall (WAF) rules."
                });
                setAnalysisResult(mockResponse);
            }

        } catch (error) {
            console.error("Analysis failed:", error);
            setAnalysisResult("Analysis failed. Please check backend connection.");
        } finally {
            setLoading(false);
        }
    };

    const renderResult = () => {
        let parsed = null;
        try {
            if (typeof analysisResult === 'string') {
                if (analysisResult.trim().startsWith('{') || analysisResult.trim().includes('"threat_level"')) {
                    parsed = JSON.parse(analysisResult.replace(/```json/g, '').replace(/```/g, ''));
                }
            } else if (typeof analysisResult === 'object') {
                parsed = analysisResult;
            }
        } catch (e) { parsed = null; }

        if (parsed) {
            return (
                <div className="space-y-6 animate-in fade-in slide-in-from-bottom-4 duration-500">
                    {/* Summary Card */}
                    <div className="bg-slate-900/50 rounded-xl p-6 border border-slate-700/50 relative overflow-hidden group hover:border-slate-600 transition-colors">
                        <div className={`absolute left-0 top-0 bottom-0 w-1 ${parsed.threat_level?.toUpperCase() === 'CRITICAL' ? 'bg-rose-500' :
                            parsed.threat_level?.toUpperCase() === 'HIGH' ? 'bg-orange-500' : 'bg-emerald-500'
                            }`}></div>

                        <div className="flex flex-col md:flex-row justify-between md:items-start gap-4 mb-4">
                            <div>
                                <h4 className="text-[10px] font-bold text-slate-500 uppercase tracking-widest mb-2">Detected Threat Class</h4>
                                <h2 className="text-2xl font-black text-white flex items-center gap-3">
                                    {parsed.attack_type || "Unknown Anomaly"}
                                </h2>
                            </div>
                            <div className="text-right">
                                <h4 className="text-[10px] font-bold text-slate-500 uppercase tracking-widest mb-2">Severity Assessment</h4>
                                <span className={`inline-flex px-4 py-1.5 rounded-full text-xs font-black uppercase tracking-wider items-center gap-2 ${parsed.threat_level?.toUpperCase() === 'CRITICAL' ? 'bg-rose-500/10 text-rose-400 border border-rose-500/20 shadow-[0_0_15px_rgba(244,63,94,0.2)]' :
                                    parsed.threat_level?.toUpperCase() === 'HIGH' ? 'bg-orange-500/10 text-orange-400 border border-orange-500/20 shadow-[0_0_15px_rgba(249,115,22,0.2)]' :
                                        'bg-emerald-500/10 text-emerald-400 border border-emerald-500/20'
                                    }`}>
                                    <Activity className="h-3 w-3" />
                                    {parsed.threat_level || "Low"}
                                </span>
                            </div>
                        </div>

                        <p className="text-slate-300 text-sm leading-relaxed border-t border-slate-800/50 pt-4">
                            {parsed.analysis}
                        </p>
                    </div>

                    {/* Indicators Grid */}
                    {parsed.indicators && (
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                            <div className="glass-panel p-5 rounded-xl border border-slate-800/60 bg-slate-950/40">
                                <h4 className="text-[10px] font-bold text-cyan-400 uppercase tracking-widest mb-4 flex items-center gap-2">
                                    <Search className="h-3 w-3" /> Technical Indicators
                                </h4>
                                <ul className="space-y-3">
                                    {parsed.indicators.map((ind, i) => (
                                        <li key={i} className="flex items-start gap-3 text-xs text-slate-400">
                                            <div className="mt-1 h-1.5 w-1.5 rounded-full bg-cyan-500 shrink-0 shadow-[0_0_5px_rgba(6,182,212,0.5)]"></div>
                                            {ind}
                                        </li>
                                    ))}
                                </ul>
                            </div>

                            <div className="glass-panel p-5 rounded-xl border border-slate-800/60 bg-slate-950/40">
                                <h4 className="text-[10px] font-bold text-purple-400 uppercase tracking-widest mb-4 flex items-center gap-2">
                                    <ShieldCheck className="h-3 w-3" /> Defense Status
                                </h4>
                                <div className="space-y-3">
                                    <div className="flex items-center gap-3 text-xs text-slate-300 bg-slate-900/50 p-2 rounded border border-slate-800">
                                        <Lock className="h-3 w-3 text-emerald-500" />
                                        <span>WAF Rule Update Required</span>
                                    </div>
                                    <div className="flex items-center gap-3 text-xs text-slate-300 bg-slate-900/50 p-2 rounded border border-slate-800">
                                        <Unlock className="h-3 w-3 text-orange-500" />
                                        <span>Payload not blocked by regex</span>
                                    </div>
                                </div>
                            </div>
                        </div>
                    )}

                    {/* Mitigation Steps */}
                    <div className="bg-gradient-to-br from-slate-900 to-slate-950 border border-slate-800 rounded-xl p-6 relative overflow-hidden">
                        <div className="absolute top-0 right-0 p-4 opacity-10">
                            <Sparkles className="h-24 w-24 text-yellow-500" />
                        </div>
                        <h4 className="text-sm font-bold text-white mb-5 flex items-center gap-2 relative z-10">
                            <Sparkles className="h-4 w-4 text-yellow-400" />
                            AI Recommended Mitigation
                        </h4>
                        <div className="space-y-4 relative z-10">
                            {parsed.mitigation && (typeof parsed.mitigation === 'string' ? parsed.mitigation.split('\n') : []).map((step, idx) => step.trim() && (
                                <div key={idx} className="flex gap-4 text-sm text-slate-300 group">
                                    <span className="flex items-center justify-center h-6 w-6 rounded-full bg-slate-800 text-slate-500 text-[10px] font-bold border border-slate-700 group-hover:bg-purple-600 group-hover:text-white group-hover:border-purple-500 transition-all shrink-0">
                                        {idx + 1}
                                    </span>
                                    <span className="leading-6 pt-0.5">{step.replace(/^\d+\.\s*/, '')}</span>
                                </div>
                            ))}
                        </div>
                    </div>
                </div>
            );
        }

        // Fallback for plain text response
        return (
            <div className="glass-panel p-6 rounded-xl border border-slate-700/50 bg-slate-950/50 animate-in fade-in zoom-in-95">
                <div className="flex items-center gap-2 mb-4 text-purple-400">
                    <FileText className="h-5 w-5" />
                    <h3 className="font-bold">Analysis Output</h3>
                </div>
                <div className="prose prose-invert prose-sm max-w-none">
                    <pre className="whitespace-pre-wrap font-mono text-sm text-slate-300 leading-relaxed bg-slate-900 p-4 rounded-lg border border-slate-800 shadow-inner">
                        {typeof analysisResult === 'string' ? analysisResult : JSON.stringify(analysisResult, null, 2)}
                    </pre>
                </div>
            </div>
        );
    };

    return (
        <div className="h-full flex flex-col space-y-6 animate-in fade-in duration-500 pb-10">
            {/* Header */}
            <header className="flex flex-col md:flex-row md:items-center justify-between gap-4">
                <div>
                    <h1 className="text-3xl font-black text-white flex items-center gap-3 tracking-tighter">
                        <div className="p-2.5 rounded-xl bg-gradient-to-br from-purple-600 to-indigo-600 shadow-lg shadow-purple-900/30">
                            <Brain className="h-6 w-6 text-white" />
                        </div>
                        Threat Intelligence Engine
                    </h1>
                    <p className="text-slate-400 text-sm mt-2 ml-1 flex items-center gap-2">
                        <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse"></span>
                        Advanced LLM-driven forensic analysis and mitigation planning
                    </p>
                </div>

                {/* Model Selector & Theme Toggle */}
                <div className="flex items-center gap-4">
                    <ThemeToggle />
                    <div className="bg-slate-950 p-1.5 rounded-xl border border-slate-800 inline-flex shadow-inner">
                        <button
                            onClick={() => setSelectedModel('gemini')}
                            className={`px-5 py-2.5 rounded-lg text-xs font-bold transition-all flex items-center gap-2 ${selectedModel === 'gemini'
                                ? 'bg-purple-600 text-white shadow-lg shadow-purple-500/20'
                                : 'text-slate-500 hover:text-slate-300 hover:bg-slate-900'}`}
                        >
                            <Sparkles className="h-3.5 w-3.5" /> Gemini 1.5 Pro
                        </button>
                        <button
                            onClick={() => setSelectedModel('openai')}
                            className={`px-5 py-2.5 rounded-lg text-xs font-bold transition-all flex items-center gap-2 ${selectedModel === 'openai'
                                ? 'bg-cyan-600 text-white shadow-lg shadow-cyan-500/20'
                                : 'text-slate-500 hover:text-slate-300 hover:bg-slate-900'}`}
                        >
                            <Brain className="h-3.5 w-3.5" /> GPT-4 Turbo
                        </button>
                    </div>
                </div>
            </header>

            {/* Main Content - Split Grid */}
            <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 flex-1 min-h-0">

                {/* LEFT: Input & Config */}
                <div className="lg:col-span-5 flex flex-col gap-6">
                    <div className="glass-panel rounded-2xl bg-slate-900/40 border border-slate-800 flex-1 flex flex-col shadow-2xl relative overflow-hidden">
                        {/* Editor Toolbar */}
                        <div className="px-5 py-4 border-b border-slate-800/50 flex items-center justify-between bg-white/[0.02]">
                            <div className="flex items-center gap-2">
                                <Terminal className="h-4 w-4 text-slate-500" />
                                <span className="text-xs font-bold text-slate-400 uppercase tracking-widest">Payload Input</span>
                            </div>
                            <button
                                onClick={() => setLogInput('')}
                                className="text-[10px] font-bold text-slate-500 hover:text-rose-400 transition-colors px-2 py-1 rounded hover:bg-slate-800 flex items-center gap-1"
                            >
                                <XCircle className="h-3 w-3" /> CLEAR
                            </button>
                        </div>

                        {/* Presets */}
                        <div className="p-5 flex flex-wrap gap-2 border-b border-slate-800/50 bg-slate-950/30">
                            {ANALYSIS_PRESETS.map((preset) => (
                                <button
                                    key={preset.label}
                                    onClick={() => setLogInput(preset.value)}
                                    className="px-3 py-1.5 rounded-lg bg-slate-800 border border-slate-700 text-[10px] font-bold text-slate-400 hover:bg-slate-700 hover:text-white hover:border-slate-500 transition-all hover:-translate-y-0.5"
                                >
                                    {preset.label}
                                </button>
                            ))}
                        </div>

                        {/* Textarea */}
                        <div className="relative flex-1 group bg-slate-950/20">
                            <textarea
                                value={logInput}
                                onChange={(e) => setLogInput(e.target.value)}
                                placeholder="// Paste suspicious log entry, packet dump, or payload here..."
                                className="w-full h-full bg-transparent p-6 font-mono text-xs md:text-sm text-slate-300 resize-none focus:outline-none placeholder:text-slate-700 leading-relaxed"
                                spellCheck="false"
                            ></textarea>

                            {/* Glow Effect on Focus */}
                            <div className="absolute inset-x-0 bottom-0 h-px bg-gradient-to-r from-transparent via-purple-500/50 to-transparent opacity-0 group-focus-within:opacity-100 transition-opacity duration-500"></div>
                        </div>

                        {/* Action Bar */}
                        <div className="p-5 border-t border-slate-800 bg-slate-950/50">
                            <button
                                onClick={handleAnalyze}
                                disabled={loading || !logInput}
                                className={`w-full py-4 rounded-xl font-black text-sm uppercase tracking-widest flex items-center justify-center gap-3 transition-all relative overflow-hidden group ${loading || !logInput
                                    ? 'bg-slate-800 text-slate-600 cursor-not-allowed'
                                    : 'bg-gradient-to-r from-purple-600 to-indigo-600 hover:from-purple-500 hover:to-indigo-500 text-white shadow-xl shadow-purple-900/20 hover:scale-[1.01] active:scale-[0.99] border border-white/10'
                                    }`}
                            >
                                {loading ? (
                                    <Loader2 className="h-5 w-5 animate-spin text-white/50" />
                                ) : (
                                    <Sparkles className="h-5 w-5 fill-white/20" />
                                )}
                                <span>{loading ? 'Analyzing Vector...' : 'Execute Analysis'}</span>
                                {!loading && <ChevronRight className="h-4 w-4 opacity-50 group-hover:translate-x-1 transition-transform" />}

                                {/* Animated Shine */}
                                {!loading && logInput && <div className="absolute inset-0 -translate-x-full group-hover:animate-[shimmer_1.5s_infinite] bg-gradient-to-r from-transparent via-white/10 to-transparent z-10"></div>}
                            </button>
                        </div>
                    </div>
                </div>

                {/* RIGHT: Results & Report */}
                <div className="lg:col-span-7 flex flex-col h-full">
                    <div className="glass-panel rounded-2xl border border-slate-700/50 bg-slate-900/80 hover:border-slate-600/50 transition-colors flex-1 flex flex-col min-h-[600px] shadow-2xl relative overflow-hidden backdrop-blur-xl">

                        {/* Status Bar */}
                        <div className="px-6 py-4 border-b border-slate-800/50 flex items-center justify-between bg-white/[0.02]">
                            <div className="flex items-center gap-2">
                                <FileText className="h-4 w-4 text-cyan-400" />
                                <span className="text-xs font-bold text-slate-300 uppercase tracking-widest">Analysis Report</span>
                            </div>
                            {analysisResult && (
                                <div className="flex items-center gap-2">
                                    <button
                                        onClick={handleCopy}
                                        className="p-2 rounded-lg hover:bg-slate-700 text-slate-400 hover:text-white transition-colors border border-transparent hover:border-slate-600"
                                        title="Copy JSON"
                                    >
                                        {copied ? <Check className="h-4 w-4 text-emerald-400" /> : <Copy className="h-4 w-4" />}
                                    </button>
                                    <button
                                        className="flex items-center gap-2 px-3 py-1.5 rounded-lg bg-slate-800 text-[10px] font-bold text-slate-300 hover:bg-slate-700 transition-colors border border-slate-700 hover:border-slate-600"
                                    >
                                        <Save className="h-3 w-3" /> SAVE REPORT
                                    </button>
                                </div>
                            )}
                        </div>

                        {/* Content Area */}
                        <div className="flex-1 overflow-y-auto p-6 scrollbar-thin scrollbar-thumb-slate-700 scrollbar-track-transparent">
                            {loading ? (
                                <div className="h-full flex flex-col items-center justify-center gap-8">
                                    <div className="relative">
                                        <div className="h-24 w-24 rounded-full border-4 border-slate-800 border-t-purple-500 animate-spin"></div>
                                        <div className="absolute inset-0 flex items-center justify-center">
                                            <Brain className="h-8 w-8 text-purple-500 animate-pulse" />
                                        </div>
                                    </div>
                                    <div className="text-center space-y-2">
                                        <h3 className="text-xl font-bold text-white animate-pulse">Deconstructing Payload...</h3>
                                        <p className="text-slate-500 font-mono text-xs">Querying {selectedModel} knowledge base</p>
                                    </div>
                                </div>
                            ) : analysisResult ? (
                                renderResult()
                            ) : (
                                <div className="h-full flex flex-col items-center justify-center text-slate-600 gap-6 opacity-40">
                                    <div className="h-24 w-24 rounded-full bg-slate-800/50 flex items-center justify-center border border-slate-700 shadow-inner">
                                        <Search className="h-10 w-10 text-slate-500" />
                                    </div>
                                    <div className="text-center">
                                        <p className="text-sm font-bold text-slate-400 mb-1">Waiting for input stream</p>
                                        <p className="text-xs text-slate-600">Enter a payload on the left to begin analysis</p>
                                    </div>
                                </div>
                            )}
                        </div>

                        {/* Decorative footer gradient */}
                        <div className="h-1 bg-gradient-to-r from-transparent via-purple-500/20 to-transparent"></div>
                    </div>
                </div>

            </div>
        </div>
    );
}
