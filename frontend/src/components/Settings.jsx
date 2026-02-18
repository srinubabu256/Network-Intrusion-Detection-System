import { useState } from 'react';
import { Save, Shield, Database, Bell, Lock, Settings as SettingsIcon } from 'lucide-react';

export default function Settings() {
    const [aiProvider, setAiProvider] = useState('gemini');
    const [notifications, setNotifications] = useState(true);
    const [autoBlock, setAutoBlock] = useState(true);

    return (
        <div className="space-y-6 animate-in fade-in slide-in-from-bottom-4 duration-500">
            <div className="bg-slate-900 border border-slate-800 rounded-xl p-6 shadow-lg">
                <h2 className="text-xl font-bold text-white mb-6 flex items-center gap-2">
                    <SettingsIcon className="h-5 w-5 text-cyan-400" /> System Settings
                </h2>

                {/* Section 1: AI Engine */}
                <div className="mb-8 p-4 bg-slate-950/50 rounded-lg border border-slate-800">
                    <h3 className="text-sm font-semibold text-slate-300 uppercase tracking-wider mb-4 flex items-center gap-2">
                        <Shield className="h-4 w-4 text-purple-400" /> AI Threat Analysis Engine
                    </h3>

                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        <button
                            onClick={() => setAiProvider('openai')}
                            className={`p-4 rounded-lg border text-left transition-all ${aiProvider === 'openai' ? 'bg-cyan-500/10 border-cyan-500/50 ring-1 ring-cyan-500/50' : 'bg-slate-900 border-slate-700 hover:bg-slate-800'}`}
                        >
                            <div className="flex items-center justify-between mb-2">
                                <span className="font-bold text-white">OpenAI GPT-4</span>
                                {aiProvider === 'openai' && <div className="h-2 w-2 bg-cyan-400 rounded-full shadow-[0_0_8px_rgba(34,211,238,0.8)]" />}
                            </div>
                            <p className="text-xs text-slate-400">Advanced reasoning for complex threat patterns. Using API Key from environment.</p>
                        </button>

                        <button
                            onClick={() => setAiProvider('gemini')}
                            className={`p-4 rounded-lg border text-left transition-all ${aiProvider === 'gemini' ? 'bg-purple-500/10 border-purple-500/50 ring-1 ring-purple-500/50' : 'bg-slate-900 border-slate-700 hover:bg-slate-800'}`}
                        >
                            <div className="flex items-center justify-between mb-2">
                                <span className="font-bold text-white">Google Gemini Pro</span>
                                {aiProvider === 'gemini' && <div className="h-2 w-2 bg-purple-400 rounded-full shadow-[0_0_8px_rgba(168,85,247,0.8)]" />}
                            </div>
                            <p className="text-xs text-slate-400">Fast, multimodal analysis for real-time detection. Using API Key from environment.</p>
                        </button>
                    </div>
                </div>

                {/* Section 2: Notifications & Security */}
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <div className="p-4 bg-slate-950/50 rounded-lg border border-slate-800">
                        <h3 className="text-sm font-semibold text-slate-300 uppercase tracking-wider mb-4 flex items-center gap-2">
                            <Bell className="h-4 w-4 text-emerald-400" /> Alerts
                        </h3>
                        <div className="flex items-center justify-between py-2 border-b border-slate-800/50">
                            <span className="text-sm text-slate-400">Real-time Browser Notifications</span>
                            <div
                                onClick={() => setNotifications(!notifications)}
                                className={`w-10 h-5 rounded-full relative cursor-pointer transition-colors ${notifications ? 'bg-emerald-500' : 'bg-slate-700'}`}
                            >
                                <div className={`absolute top-1 left-1 bg-white h-3 w-3 rounded-full transition-transform ${notifications ? 'translate-x-5' : 'translate-x-0'}`} />
                            </div>
                        </div>
                    </div>

                    <div className="p-4 bg-slate-950/50 rounded-lg border border-slate-800">
                        <h3 className="text-sm font-semibold text-slate-300 uppercase tracking-wider mb-4 flex items-center gap-2">
                            <Lock className="h-4 w-4 text-rose-400" /> Automated Defense
                        </h3>
                        <div className="flex items-center justify-between py-2 border-b border-slate-800/50">
                            <span className="text-sm text-slate-400">Auto-Block Critical Threats</span>
                            <div
                                onClick={() => setAutoBlock(!autoBlock)}
                                className={`w-10 h-5 rounded-full relative cursor-pointer transition-colors ${autoBlock ? 'bg-rose-500' : 'bg-slate-700'}`}
                            >
                                <div className={`absolute top-1 left-1 bg-white h-3 w-3 rounded-full transition-transform ${autoBlock ? 'translate-x-5' : 'translate-x-0'}`} />
                            </div>
                        </div>
                    </div>
                </div>

                {/* Section 3: Data Management */}
                <div className="mt-8 p-4 bg-slate-950/50 rounded-lg border border-slate-800">
                    <h3 className="text-sm font-semibold text-slate-300 uppercase tracking-wider mb-4 flex items-center gap-2">
                        <Database className="h-4 w-4 text-blue-400" /> Database & Logs
                    </h3>
                    <div className="flex items-center justify-between">
                        <div>
                            <p className="text-sm text-slate-300 font-medium">Clear Threat History</p>
                            <p className="text-xs text-slate-500">Remove all logged incidents and analysis reports locally.</p>
                        </div>
                        <button
                            onClick={async () => {
                                try {
                                    await fetch('/api/clear_data', { method: 'POST' });
                                    // Optional: Add a toast notification here
                                } catch (e) {
                                    console.error("Failed to clear data", e);
                                }
                            }}
                            className="px-4 py-2 bg-rose-500/10 hover:bg-rose-500/20 text-rose-400 text-xs font-bold uppercase tracking-wider rounded border border-rose-500/20 transition-all">
                            Clear Database
                        </button>
                    </div>
                </div>

                <div className="mt-6 flex justify-end">
                    <button className="flex items-center gap-2 px-6 py-2 bg-cyan-600 hover:bg-cyan-500 text-white font-bold rounded-lg shadow-lg shadow-cyan-500/20 transition-all">
                        <Save className="h-4 w-4" /> Save Settings
                    </button>
                </div>
            </div>
        </div>
    )
}
