import { createContext, useContext, useState, useEffect } from 'react';
import { socket } from '../hooks/useSocket';

const SimulationContext = createContext();

// Helper to generate dynamic random threats so the log is never empty on load
const generateRandomThreats = (count) => {
    const attackTypes = ['DoS', 'Probe', 'R2L', 'U2R', 'SQL Injection', 'XSS', 'Malware C&C'];
    const severities = ['Critical', 'High', 'Medium', 'Low'];
    const statuses = ['Blocked', 'Detected', 'Quarantined', 'Allowed'];
    const locations = ['China', 'Russia', 'USA', 'Germany', 'Brazil', 'Unknown', 'Local Network'];

    return Array.from({ length: count }).map((_, i) => {
        const type = attackTypes[Math.floor(Math.random() * attackTypes.length)];
        // Logic to correlate severity somewhat with type for realism
        let severity = severities[Math.floor(Math.random() * severities.length)];
        if (type === 'DoS' || type === 'Malware C&C') severity = Math.random() > 0.3 ? 'Critical' : 'High';

        return {
            id: `mock-${Date.now()}-${i}`,
            type: type,
            source: `${Math.floor(Math.random() * 255)}.${Math.floor(Math.random() * 255)}.${Math.floor(Math.random() * 255)}.${Math.floor(Math.random() * 255)}`,
            severity: severity,
            status: statuses[Math.floor(Math.random() * statuses.length)],
            timestamp: new Date(Date.now() - Math.floor(Math.random() * 10000000)).toLocaleString(),
            location: locations[Math.floor(Math.random() * locations.length)],
            analysis: "Historical data record. Pattern matches known signature."
        };
    }).sort((a, b) => new Date(b.timestamp) - new Date(a.timestamp));
};

export function SimulationProvider({ children }) {
    const [traffic, setTraffic] = useState([]);

    // Generate random data once on mount to populate initial view
    const [initialThreats] = useState(() => generateRandomThreats(Math.floor(Math.random() * 10) + 15));
    const [threats, setThreats] = useState(initialThreats);

    const [stats, setStats] = useState({
        total_scanned: 12450 + Math.floor(Math.random() * 5000),
        threats_detected: initialThreats.length,
        blocked: Math.floor(initialThreats.length * 0.8),
        cpu_usage: 10 + Math.floor(Math.random() * 15),
        network_load: 0,
        protocols: { TCP: 0, UDP: 0, ICMP: 0 },
        attacks: { DoS: 0, Probe: 0, R2L: 0, U2R: 0, Normal: 0 }
    });

    const [isConnected, setIsConnected] = useState(socket.connected);
    const [loadHistory, setLoadHistory] = useState(Array(10).fill(100));
    const [pps, setPps] = useState(0);

    useEffect(() => {
        function onConnect() { setIsConnected(true); }
        function onDisconnect() { setIsConnected(false); }

        socket.on('connect', onConnect);
        socket.on('disconnect', onDisconnect);

        // Packet Counter for PPS
        let packetCounter = 0;
        const ppsInterval = setInterval(() => {
            setPps(packetCounter);
            packetCounter = 0;
        }, 1000);

        socket.on('traffic_update', (data) => {
            packetCounter++;
            setTraffic(prev => {
                const newTraffic = [...prev, data];
                if (newTraffic.length > 100) newTraffic.shift(); // Keep last 100 globallly
                return newTraffic;
            });
        });

        socket.on('stats_update', (data) => {
            setStats(data);
            setLoadHistory(prev => {
                const newHistory = [...prev, data.network_load];
                if (newHistory.length > 20) newHistory.shift();
                return newHistory;
            });
        });

        socket.on('threat_alert', (alert) => {
            setThreats(prev => [{
                ...alert,
                status: 'Detected',
                timestamp: new Date().toLocaleTimeString(),
            }, ...prev]);
        });

        socket.on('data_cleared', () => {
            setTraffic([]);
            setThreats([]);
            setStats({
                total_scanned: 0,
                threats_detected: 0,
                blocked: 0,
                cpu_usage: 0,
                network_load: 0,
                protocols: { TCP: 0, UDP: 0, ICMP: 0 },
                attacks: { DoS: 0, Threat: 0, Probe: 0, R2L: 0, U2R: 0, Normal: 0 }
            });
            setLoadHistory(Array(10).fill(0));
            setPps(0);
        });

        return () => {
            socket.off('connect', onConnect);
            socket.off('disconnect', onDisconnect);
            socket.off('traffic_update');
            socket.off('stats_update');
            socket.off('threat_alert');
            socket.off('data_cleared');
            clearInterval(ppsInterval);
        }
    }, []);

    return (
        <SimulationContext.Provider value={{ traffic, stats, threats, isConnected, loadHistory, pps }}>
            {children}
        </SimulationContext.Provider>
    );
}

export function useSimulation() {
    return useContext(SimulationContext);
}
