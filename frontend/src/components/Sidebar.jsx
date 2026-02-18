import { LayoutDashboard, Users, ShieldAlert, Settings, Activity, Play, Pause, Database, ChevronDown, Server, RotateCcw, Search } from "lucide-react";
import { Link, useLocation } from "react-router-dom";
import { useState, useEffect, useRef } from "react";

const DatasetSelector = ({ isSimulating }) => {
    const [datasets, setDatasets] = useState([]);
    const [current, setCurrent] = useState("");
    const [isOpen, setIsOpen] = useState(false);
    const [loading, setLoading] = useState(false);
    const dropdownRef = useRef(null);

    useEffect(() => {
        fetch('/api/available_datasets')
            .then(res => res.json())
            .then(data => {
                setDatasets(data.datasets);
                setCurrent(data.current);
            })
            .catch(err => console.error(err));

        const handleClickOutside = (event) => {
            if (dropdownRef.current && !dropdownRef.current.contains(event.target)) {
                setIsOpen(false);
            }
        };
        document.addEventListener("mousedown", handleClickOutside);
        return () => document.removeEventListener("mousedown", handleClickOutside);
    }, []);

    const handleSelect = async (dataset) => {
        if (loading || isSimulating) return;
        setLoading(true);
        try {
            const res = await fetch('/api/set_dataset', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ dataset })
            });
            const data = await res.json();
            if (data.status === 'Dataset updated') {
                setCurrent(dataset);
            }
        } catch (error) {
            console.error("Failed to set dataset", error);
        } finally {
            setLoading(false);
            setIsOpen(false);
        }
    };

    return (
        <div className="relative mb-6" ref={dropdownRef}>
            <div className="px-4 mb-2">
                <span className="text-[10px] text-slate-500 uppercase tracking-wider font-bold">Active Dataset</span>
            </div>
            <button
                onClick={() => !isSimulating && setIsOpen(!isOpen)}
                disabled={isSimulating}
                className={`w-[calc(100%-32px)] mx-4 flex items-center justify-between px-3 py-2.5 rounded-xl border transition-all ${isSimulating
                    ? 'opacity-50 cursor-not-allowed bg-slate-900/50 border-slate-800'
                    : 'bg-slate-900 border-slate-700 hover:border-cyan-500/50 hover:bg-slate-800 hover:shadow-[0_0_15px_rgba(6,182,212,0.1)]'}`}
            >
                <div className="flex items-center gap-3 overflow-hidden">
                    <div className="p-1.5 rounded-lg bg-cyan-950/30 text-cyan-400 shrink-0">
                        <Database className="h-4 w-4" />
                    </div>
                    <span className="text-sm font-semibold text-slate-200 truncate">{current || "Loading..."}</span>
                </div>
                <ChevronDown className={`h-4 w-4 text-slate-500 transition-transform duration-200 shrink-0 ${isOpen ? 'rotate-180' : ''}`} />
            </button>

            {isOpen && (
                <div className="absolute top-full left-4 right-4 mt-2 bg-slate-950 border border-slate-700 rounded-xl shadow-2xl z-50 overflow-hidden flex flex-col p-1 animate-in fade-in zoom-in-95 duration-200">
                    {datasets.map((ds) => (
                        <button
                            key={ds}
                            onClick={() => handleSelect(ds)}
                            disabled={loading}
                            className={`flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm text-left transition-colors ${current === ds
                                ? 'bg-cyan-500/10 text-cyan-400'
                                : 'text-slate-400 hover:bg-slate-900 hover:text-slate-200'}`}
                        >
                            <Server className="h-4 w-4 opacity-50 shrink-0" />
                            <span className="truncate">{ds}</span>
                            {loading && current === ds && <RotateCcw className="h-3 w-3 animate-spin ml-auto" />}
                        </button>
                    ))}
                </div>
            )}
        </div>
    );
}

export default function Sidebar({ simulationStatus, toggleSimulation }) {
    const location = useLocation();
    const isActive = (path) => location.pathname === path;
    const [intensity, setIntensity] = useState(50);

    const handleIntensityChange = (e) => {
        const val = parseInt(e.target.value);
        setIntensity(val);
        // Debounce update to backend
        fetch('/api/set_intensity', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ intensity: val })
        }).catch(err => console.error("Failed to update intensity", err));
    };

    return (
        <div className="w-64 h-screen bg-slate-950 border-r border-slate-800 flex flex-col fixed left-0 top-0 overflow-visible z-50 shadow-2xl">
            {/* Brand */}
            <div className="p-6 border-b border-slate-800 flex items-center gap-3 bg-slate-950">
                <div className="h-8 w-8 bg-cyan-600 rounded-lg flex items-center justify-center shadow-[0_0_15px_rgba(8,145,178,0.4)]">
                    <ShieldAlert className="h-5 w-5 text-white" />
                </div>
                <div>
                    <h1 className="text-lg font-black text-white tracking-wide">N.I.D.S</h1>
                    <p className="text-[10px] text-slate-400 font-bold uppercase tracking-wider">Adaptive Defense</p>
                </div>
            </div>

            {/* Active Dataset Selection */}
            <div className="pt-4 relative z-20">
                <DatasetSelector isSimulating={simulationStatus} />
                <div className="mx-6 border-t border-slate-800/50"></div>
            </div>

            {/* Navigation */}
            <nav className="flex-1 px-4 pb-4 space-y-1 overflow-y-auto relative z-10">

                <div className="text-[10px] font-bold text-slate-500 px-3 mb-3 uppercase tracking-wider">System</div>

                <Link to="/" className={`flex items-center gap-3 px-3 py-2.5 rounded-xl text-sm font-bold transition-all ${isActive('/')
                    ? 'bg-cyan-500 text-slate-950 shadow-[0_0_20px_rgba(6,182,212,0.3)]'
                    : 'text-slate-400 hover:bg-slate-900 hover:text-slate-200'}`}>
                    <LayoutDashboard className="h-4 w-4" />
                    Dashboard
                </Link>

                <Link to="/threats" className={`flex items-center gap-3 px-3 py-2.5 rounded-xl text-sm font-bold transition-all ${isActive('/threats')
                    ? 'bg-rose-500 text-white shadow-[0_0_20px_rgba(244,63,94,0.3)]'
                    : 'text-slate-400 hover:bg-slate-900 hover:text-slate-200'}`}>
                    <Users className="h-4 w-4" />
                    Threats
                </Link>

                <Link to="/settings" className={`flex items-center gap-3 px-3 py-2.5 rounded-xl text-sm font-bold transition-all ${isActive('/settings')
                    ? 'bg-slate-800 text-white'
                    : 'text-slate-400 hover:bg-slate-900 hover:text-slate-200'}`}>
                    <Settings className="h-4 w-4" />
                    Settings
                </Link>

                <div className="text-[10px] font-bold text-slate-500 px-3 mt-4 mb-3 uppercase tracking-wider">Analytics</div>

                <Link to="/comparison" className={`flex items-center gap-3 px-3 py-2.5 rounded-xl text-sm font-bold transition-all ${isActive('/comparison')
                    ? 'bg-purple-600 text-white shadow-[0_0_20px_rgba(147,51,234,0.3)]'
                    : 'text-slate-400 hover:bg-slate-900 hover:text-slate-200'}`}>
                    <Activity className="h-4 w-4" />
                    Model Comparison
                </Link>

                <Link to="/analysis" className={`flex items-center gap-3 px-3 py-2.5 rounded-xl text-sm font-bold transition-all ${isActive('/analysis')
                    ? 'bg-cyan-600 text-white shadow-[0_0_20px_rgba(8,145,178,0.3)]'
                    : 'text-slate-400 hover:bg-slate-900 hover:text-slate-200'}`}>
                    <Search className="h-4 w-4" />
                    Deep Analysis
                </Link>



            </nav>

            {/* Simulator Control */}
            <div className="p-4 border-t border-slate-800 bg-slate-900/30 backdrop-blur-sm">
                <div className="text-[10px] font-bold text-slate-500 mb-4 uppercase tracking-wider flex items-center justify-between">
                    <span>Simulation Control</span>
                    <Activity className={`h-3 w-3 ${simulationStatus ? 'text-emerald-500 animate-pulse' : 'text-slate-600'}`} />
                </div>

                <div className="bg-slate-900 rounded-xl p-4 border border-slate-700/50 mb-4">
                    <div className="flex justify-between text-xs font-bold text-slate-400 mb-2">
                        <span>Intensity</span>
                        <span className="text-cyan-400">{intensity}%</span>
                    </div>
                    <input
                        type="range"
                        min="1"
                        max="100"
                        value={intensity}
                        onChange={handleIntensityChange}
                        className="w-full h-1.5 bg-slate-700 rounded-lg appearance-none cursor-pointer accent-cyan-500 hover:accent-cyan-400 transition-all"
                    />
                </div>

                <button
                    onClick={toggleSimulation}
                    className={`w-full flex items-center justify-center gap-2 py-3 rounded-xl text-xs font-black uppercase tracking-wider transition-all shadow-lg hover:scale-[1.02] active:scale-[0.98] ${simulationStatus
                        ? 'bg-rose-500 text-white shadow-rose-500/20 hover:bg-rose-400'
                        : 'bg-emerald-500 text-slate-950 shadow-emerald-500/20 hover:bg-emerald-400'}`}
                >
                    {simulationStatus ? <Pause className="h-4 w-4 fill-current" /> : <Play className="h-4 w-4 fill-current" />}
                    {simulationStatus ? 'Stop System' : 'Start System'}
                </button>
            </div>
        </div>
    );
}
