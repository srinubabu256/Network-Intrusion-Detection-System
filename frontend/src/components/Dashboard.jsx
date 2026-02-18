import { useState, useEffect } from "react"
import { useSocket, socket } from "../hooks/useSocket"
import { useSimulation } from "../context/SimulationContext"
import { BarChart, Bar, ResponsiveContainer, Label, XAxis, YAxis, Tooltip, Legend, PieChart, Pie, Cell, AreaChart, Area, CartesianGrid } from 'recharts'
import { BadgeCheck, ShieldAlert, Cpu, Activity, Info, Loader2, Network } from "lucide-react"

// Theme Colors
const COLORS = ['#0ea5e9', '#f59e0b', '#f43f5e', '#8b5cf6', '#10b981'];
const DARK_BG = "#020617";



const AttackDistributionChart = ({ stats }) => {
    const data = stats?.protocols ? [
        { name: 'TCP', value: stats.protocols.TCP || 0 },
        { name: 'UDP', value: stats.protocols.UDP || 0 },
        { name: 'ICMP', value: stats.protocols.ICMP || 0 },
    ] : [];

    return (
        <div className="h-56 w-full min-w-0 relative">
            <ResponsiveContainer width="99%" height="100%" debounce={50}>
                <PieChart>
                    <Pie
                        data={data}
                        cx="50%"
                        cy="50%"
                        innerRadius={60}
                        outerRadius={80}
                        paddingAngle={5}
                        dataKey="value"
                        stroke="none"
                    >
                        {data.map((entry, index) => (
                            <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                        ))}
                    </Pie>
                    <Tooltip
                        contentStyle={{ backgroundColor: 'rgba(2, 6, 23, 0.9)', borderColor: 'rgba(30, 41, 59, 0.5)', borderRadius: '8px', color: '#fff' }}
                        itemStyle={{ color: '#94a3b8' }}
                    />
                    <Legend verticalAlign="bottom" height={36} iconType="circle" />
                </PieChart>
            </ResponsiveContainer>
        </div>
    )
}

const TrafficVolumeChart = ({ stats }) => {
    const data = stats?.attacks ? [
        { name: 'DoS', count: stats.attacks.DoS || 0 },
        { name: 'Probe', count: stats.attacks.Probe || 0 },
        { name: 'R2L', count: stats.attacks.R2L || 0 },
        { name: 'U2R', count: stats.attacks.U2R || 0 },
        { name: 'Normal', count: stats.attacks.Normal || 0 },
    ] : [];

    return (
        <div className="h-56 w-full min-w-0 relative">
            <ResponsiveContainer width="99%" height="100%" debounce={50}>
                <BarChart data={data} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
                    <defs>
                        <linearGradient id="colorCount" x1="0" y1="0" x2="0" y2="1">
                            <stop offset="5%" stopColor="#8b5cf6" stopOpacity={0.8} />
                            <stop offset="95%" stopColor="#8b5cf6" stopOpacity={0} />
                        </linearGradient>
                    </defs>
                    <CartesianGrid strokeDasharray="3 3" stroke="#1e293b" vertical={false} />
                    <XAxis dataKey="name" stroke="#64748b" fontSize={11} tickLine={false} axisLine={false} dy={10} />
                    <YAxis stroke="#64748b" fontSize={11} tickLine={false} axisLine={false} />
                    <Tooltip
                        cursor={{ fill: 'rgba(56, 189, 248, 0.05)' }}
                        contentStyle={{ backgroundColor: 'rgba(2, 6, 23, 0.9)', borderColor: 'rgba(30, 41, 59, 0.5)', borderRadius: '8px', color: '#fff' }}
                    />
                    <Bar dataKey="count" fill="url(#colorCount)" barSize={32} radius={[6, 6, 0, 0]} />
                </BarChart>
            </ResponsiveContainer>
        </div>
    )
}

const LiveTable = ({ traffic }) => {
    return (
        <div className="w-full overflow-hidden rounded-xl border border-white/5 bg-slate-900/40 backdrop-blur-md">
            <div className="overflow-x-auto max-h-[400px] scrollbar-thin">
                <table className="w-full text-left text-sm text-slate-300">
                    <thead className="sticky top-0 bg-slate-950/90 backdrop-blur border-b border-white/5 text-xs font-bold uppercase tracking-wider text-slate-500 z-10">
                        <tr>
                            <th className="px-4 py-3">Time</th>
                            <th className="px-4 py-3">Source / Dest</th>
                            <th className="px-4 py-3 text-center">Protocol</th>
                            <th className="px-4 py-3">Info</th>
                            <th className="px-4 py-3 text-center">Prediction</th>
                            <th className="px-4 py-3 text-right">Status</th>
                        </tr>
                    </thead>
                    <tbody className="divide-y divide-white/5">
                        {traffic.slice(-15).reverse().map((t) => (
                            <tr key={t.id} className="hover:bg-cyan-500/5 transition-colors group">
                                <td className="px-4 py-3 font-mono text-xs text-slate-500">{t.timestamp}</td>
                                <td className="px-4 py-3">
                                    <div className="flex flex-col text-xs font-mono">
                                        <span className="text-cyan-400 mb-0.5">{t.source_ip}</span>
                                        <span className="text-slate-500 flex items-center gap-1">
                                            <span className="w-1 h-1 rounded-full bg-slate-600"></span>
                                            {t.dest_ip}
                                        </span>
                                    </div>
                                </td>
                                <td className="px-4 py-3 text-center">
                                    <span className={`px-2 py-1 rounded-md text-[10px] font-bold tracking-wider ${t.protocol === 'TCP' ? 'bg-blue-500/10 text-blue-400 border border-blue-500/20' :
                                        t.protocol === 'UDP' ? 'bg-orange-500/10 text-orange-400 border border-orange-500/20' :
                                            'bg-slate-500/10 text-slate-400 border border-slate-500/20'
                                        }`}>
                                        {t.protocol}
                                    </span>
                                </td>
                                <td className="px-4 py-3 text-xs text-slate-400">{t.info}</td>
                                <td className="px-4 py-3 text-center">
                                    <span className={`px-2 py-0.5 rounded text-xs font-bold ${t.prediction === 'Normal' ? 'text-emerald-400' : 'text-rose-400 bg-rose-500/10 border border-rose-500/20 shadow-[0_0_10px_rgba(244,63,94,0.2)]'
                                        }`}>
                                        {t.prediction}
                                    </span>
                                </td>
                                <td className="px-4 py-3 text-right">
                                    {t.status === 'Blocked' ? (
                                        <span className="inline-flex items-center gap-1.5 text-rose-400 text-xs font-bold">
                                            <ShieldAlert className="h-3.5 w-3.5" /> Blocked
                                        </span>
                                    ) : (
                                        <span className="inline-flex items-center gap-1.5 text-emerald-500 text-xs font-bold">
                                            <BadgeCheck className="h-3.5 w-3.5" /> Allowed
                                        </span>
                                    )}
                                </td>
                            </tr>
                        ))}
                        {traffic.length === 0 && (
                            <tr>
                                <td colSpan="6" className="px-4 py-12 text-center text-slate-600 font-mono text-sm">
                                    <div className="flex flex-col items-center gap-3">
                                        <div className="h-10 w-10 rounded-full bg-slate-800/50 flex items-center justify-center">
                                            <Activity className="h-5 w-5 text-slate-500" />
                                        </div>
                                        <div>
                                            <p className="font-bold text-slate-400">System Ready</p>
                                            <p className="text-xs text-slate-600 mt-1">Start simulation to view live traffic analysis</p>
                                        </div>
                                    </div>
                                </td>
                            </tr>
                        )}
                    </tbody>
                </table>
            </div>
        </div>
    )
}

export default function Dashboard({ isSimulating, toggleSimulation }) {
    const { traffic, stats, threats, isConnected, pps, loadHistory } = useSimulation();
    const [currentTime, setCurrentTime] = useState(new Date());

    useEffect(() => {
        const timer = setInterval(() => setCurrentTime(new Date()), 1000);
        return () => clearInterval(timer);
    }, []);

    return (
        <div className="space-y-6 animate-in fade-in duration-700">
            {/* Status Bar */}
            <div className="glass-panel p-4 rounded-2xl flex justify-between items-center">
                <div className="flex items-center gap-3">
                    <div className="p-2 rounded-lg bg-emerald-500/10 border border-emerald-500/20">
                        <Activity className="h-4 w-4 text-emerald-400" />
                    </div>
                    <div>
                        <span className="block text-[10px] text-slate-500 uppercase font-bold tracking-wider">System Status</span>
                        <span className="text-sm font-bold text-slate-200 flex items-center gap-2">
                            {isConnected ? 'Connected' : 'Disconnected'}
                            <span className={`h-2 w-2 rounded-full ${isConnected ? 'bg-emerald-500 shadow-[0_0_10px_#10b981]' : 'bg-rose-500'}`}></span>
                        </span>
                    </div>
                </div>

                <div className="text-right">
                    <span className="block text-[10px] text-slate-500 uppercase font-bold tracking-wider">Current Time</span>
                    <span className="text-xl font-mono font-bold text-white tracking-widest">
                        {currentTime.toLocaleTimeString()}
                    </span>
                </div>
            </div>

            {/* Stats Cards */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
                <div className="glass-card p-5 rounded-2xl relative overflow-hidden group">
                    <div className="absolute top-0 right-0 p-3 opacity-10 group-hover:opacity-20 transition-opacity">
                        <Network className="h-16 w-16 text-cyan-500" />
                    </div>
                    <span className="text-slate-500 text-[10px] font-bold uppercase tracking-wider block mb-1">Total Packets Scanned</span>
                    <div className="text-3xl font-black text-white tracking-tight mb-2">
                        {stats.total_scanned.toLocaleString()}
                    </div>
                    <div className="text-xs text-cyan-400 font-medium flex items-center gap-1">
                        <Activity className="h-3 w-3" /> +{pps}/sec
                    </div>
                </div>

                <div className="glass-card p-5 rounded-2xl relative overflow-hidden group border-rose-500/10">
                    <div className="absolute top-0 right-0 p-3 opacity-10 group-hover:opacity-20 transition-opacity">
                        <ShieldAlert className="h-16 w-16 text-rose-500" />
                    </div>
                    <span className="text-slate-500 text-[10px] font-bold uppercase tracking-wider block mb-1">Threats Neutralized</span>
                    <div className="text-3xl font-black text-white tracking-tight mb-2">
                        {stats.blocked.toLocaleString()}
                    </div>
                    <div className="text-xs text-rose-400 font-medium flex items-center gap-1">
                        {stats.threats_detected > 0 ? ((stats.blocked / stats.threats_detected) * 100).toFixed(1) : 0}% Success Rate
                    </div>
                </div>

                <div className="glass-card p-5 rounded-2xl relative overflow-hidden">
                    <span className="text-slate-500 text-[10px] font-bold uppercase tracking-wider block mb-1">CPU Load</span>
                    <div className="flex items-end gap-2 mb-2">
                        <div className="text-3xl font-black text-white tracking-tight">{stats.cpu_usage}%</div>
                        <div className="text-xs text-slate-400 mb-1.5">Usage</div>
                    </div>
                    <div className="w-full bg-slate-800/50 h-1.5 rounded-full overflow-hidden">
                        <div
                            className={`h-full transition-all duration-500 ease-out rounded-full ${stats.cpu_usage > 80 ? 'bg-rose-500' : 'bg-emerald-500'}`}
                            style={{ width: `${stats.cpu_usage}%` }}
                        />
                    </div>
                </div>

                <div className="glass-card p-5 rounded-2xl relative overflow-hidden">
                    <span className="text-slate-500 text-[10px] font-bold uppercase tracking-wider block mb-1">Network Throughput</span>
                    <div className="flex items-end gap-2 mb-2">
                        <div className="text-3xl font-black text-white tracking-tight">{stats.network_load}</div>
                        <div className="text-xs text-slate-400 mb-1.5">Mbps</div>
                    </div>
                    <div className="flex gap-0.5 h-1.5 items-end">
                        {loadHistory.map((load, i) => (
                            <div key={i} className="flex-1 bg-cyan-500/20 rounded-sm h-full overflow-hidden flex items-end">
                                <div
                                    className="bg-cyan-500 w-full transition-all duration-300"
                                    style={{ height: `${Math.min(100, (load / 1000) * 100)}%` }}
                                ></div>
                            </div>
                        ))}
                    </div>
                </div>
            </div>

            {/* Main Content Grid */}
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                {/* Live Feed */}
                <div className="lg:col-span-2 space-y-6">
                    <div className="glass-panel p-1 rounded-2xl">
                        <div className="px-5 py-4 border-b border-white/5 flex justify-between items-center">
                            <h3 className="text-sm font-bold text-slate-200 flex items-center gap-2">
                                <Activity className="h-4 w-4 text-cyan-400" />
                                Live Traffic Stream
                            </h3>
                            <span className="text-[10px] text-slate-500 uppercase font-bold tracking-wider">
                                Packet / sec: {pps}
                            </span>
                        </div>
                        <div className="p-1">
                            <LiveTable traffic={traffic} />
                        </div>
                    </div>

                    <div className="glass-panel p-5 rounded-2xl">
                        <h3 className="text-sm font-bold text-slate-200 mb-4">Traffic Volume Analysis</h3>
                        <TrafficVolumeChart stats={stats} />
                    </div>
                </div>

                {/* Sidebar Stats & Threats */}
                <div className="space-y-6">
                    <div className="glass-panel p-5 rounded-2xl">
                        <h3 className="text-sm font-bold text-slate-200 mb-2">Protocol Distribution</h3>
                        <AttackDistributionChart stats={stats} />
                        <div className="grid grid-cols-3 gap-2 mt-4">
                            {Object.entries(stats.protocols).map(([key, value], idx) => (
                                <div key={key} className="text-center p-2 rounded-lg bg-slate-800/30 border border-white/5">
                                    <div className="text-[10px] text-slate-500 uppercase font-bold">{key}</div>
                                    <div className="text-sm font-bold text-slate-200">{value}</div>
                                </div>
                            ))}
                        </div>
                    </div>

                    {/* Threat Feed */}
                    <div className="glass-panel p-5 rounded-2xl h-[400px] flex flex-col">
                        <div className="flex justify-between items-center mb-4">
                            <h3 className="text-sm font-bold text-rose-400 flex items-center gap-2">
                                <ShieldAlert className="h-4 w-4" />
                                Recent Threats
                            </h3>
                            <span className="px-2 py-0.5 rounded text-[10px] font-bold bg-rose-500/20 text-rose-400 border border-rose-500/20">
                                {threats.length} Active
                            </span>
                        </div>

                        <div className="flex-1 overflow-y-auto scrollbar-thin space-y-3 pr-2">
                            {threats.length === 0 ? (
                                <div className="h-full flex flex-col items-center justify-center text-slate-600 text-xs">
                                    <ShieldAlert className="h-8 w-8 mb-2 opacity-20" />
                                    No active threats detected
                                </div>
                            ) : (
                                threats.map((threat, idx) => (
                                    <div key={idx} className="bg-rose-950/10 border border-rose-500/20 p-3 rounded-xl hover:bg-rose-950/20 transition-colors cursor-default">
                                        <div className="flex justify-between items-start mb-1">
                                            <span className="font-bold text-rose-300 text-xs uppercase tracking-wide">{threat.type} Attack</span>
                                            <span className="text-[10px] text-slate-500 font-mono">{new Date().toLocaleTimeString()}</span>
                                        </div>
                                        <div className="text-[11px] text-slate-400 font-mono mb-2">
                                            SRC: {threat.source}
                                        </div>
                                        <div className="text-[10px] leading-relaxed text-slate-300 bg-black/20 p-2 rounded border border-rose-500/10">
                                            {threat.analysis || "Analyzing traffic pattern..."}
                                        </div>
                                    </div>
                                ))
                            )}
                        </div>
                    </div>
                </div>
            </div>
        </div>
    )
}
