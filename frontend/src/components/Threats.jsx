import { useState } from "react";
import { ShieldAlert, Search, Filter, AlertTriangle, CheckCircle, Shield, Calendar, MapPin } from "lucide-react";
import { useSimulation } from '../context/SimulationContext';

export default function Threats() {
    const { threats } = useSimulation();
    const [filter, setFilter] = useState('All');

    const filteredThreats = filter === 'All' ? threats : threats.filter(t => t.severity === filter);

    return (
        <div className="space-y-6 animate-in fade-in duration-700">
            <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
                <div>
                    <h2 className="text-2xl font-bold text-white flex items-center gap-2">
                        <ShieldAlert className="h-6 w-6 text-rose-500" />
                        Threat Intelligence Log
                    </h2>
                    <p className="text-slate-400 text-sm">Real-time monitoring and historical records of security incidents.</p>
                </div>

                <div className="flex items-center gap-2 bg-slate-900 p-1 rounded-xl border border-slate-700">
                    {['All', 'Critical', 'High', 'Low'].map(f => (
                        <button
                            key={f}
                            onClick={() => setFilter(f)}
                            className={`px-3 py-1.5 rounded-lg text-xs font-bold transition-all ${filter === f
                                    ? 'bg-slate-700 text-white shadow'
                                    : 'text-slate-500 hover:text-slate-300'
                                }`}
                        >
                            {f}
                        </button>
                    ))}
                </div>
            </div>

            <div className="glass-panel rounded-2xl overflow-hidden min-h-[500px] border border-slate-800">
                <div className="overflow-x-auto">
                    <table className="w-full text-sm text-left text-slate-400">
                        <thead className="bg-slate-950/50 text-xs text-slate-500 uppercase font-bold tracking-wider border-b border-slate-800">
                            <tr>
                                <th className="px-6 py-4">Status</th>
                                <th className="px-6 py-4">Severity</th>
                                <th className="px-6 py-4">Threat Type</th>
                                <th className="px-6 py-4">Source IP</th>
                                {/* <th className="px-6 py-4">Location</th> */}
                                <th className="px-6 py-4 text-right">Action</th>
                            </tr>
                        </thead>
                        <tbody className="divide-y divide-slate-800/50">
                            {filteredThreats.map((threat, idx) => (
                                <tr key={idx} className="hover:bg-slate-800/30 transition-colors group">
                                    <td className="px-6 py-4">
                                        {threat.status === 'Blocked' || threat.status === 'Detected' ? (
                                            <span className="inline-flex items-center gap-1.5 text-rose-400 text-xs font-bold px-2 py-1 rounded bg-rose-500/10 border border-rose-500/20">
                                                <Shield className="h-3 w-3" /> {threat.status}
                                            </span>
                                        ) : (
                                            <span className="inline-flex items-center gap-1.5 text-emerald-400 text-xs font-bold px-2 py-1 rounded bg-emerald-500/10 border border-emerald-500/20">
                                                <CheckCircle className="h-3 w-3" /> {threat.status}
                                            </span>
                                        )}
                                    </td>
                                    <td className="px-6 py-4">
                                        <span className={`font-bold ${threat.severity === 'Critical' ? 'text-rose-500' :
                                                threat.severity === 'High' ? 'text-orange-500' : 'text-slate-500'
                                            }`}>
                                            {threat.severity}
                                        </span>
                                    </td>
                                    <td className="px-6 py-4 font-mono text-slate-300">{threat.type}</td>
                                    <td className="px-6 py-4 font-mono text-cyan-400">{threat.source}</td>
                                    {/* <td className="px-6 py-4 flex items-center gap-2">
                                        <MapPin className="h-3 w-3 text-slate-600" />
                                        {threat.location || 'N/A'}
                                    </td> */}
                                    <td className="px-6 py-4 text-right">
                                        <button className="text-xs font-bold text-cyan-400 hover:text-cyan-300 hover:underline">
                                            Analyze
                                        </button>
                                    </td>
                                </tr>
                            ))}
                            {filteredThreats.length === 0 && (
                                <tr>
                                    <td colSpan="7" className="px-6 py-12 text-center text-slate-600">
                                        No threats matching filter found.
                                    </td>
                                </tr>
                            )}
                        </tbody>
                    </table>
                </div>
            </div>
        </div>
    );
}
