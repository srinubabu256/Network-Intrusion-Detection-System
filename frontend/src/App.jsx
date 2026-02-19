import { useState } from 'react'
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom'
import Sidebar from './components/Sidebar'
import Dashboard from './components/Dashboard'
import Settings from './components/Settings'
import Comparison from './components/Comparison'
import Threats from './components/Threats'
import Analysis from './components/Analysis'
import { ThemeProvider } from './hooks/useTheme'
import ThemeToggle from './components/ThemeToggle'
import { SimulationProvider } from './context/SimulationContext'

function App() {
  const [isSimulating, setIsSimulating] = useState(false);

  const toggleSimulation = async () => {
    try {
      if (isSimulating) {
        await fetch('/api/stop_simulation', { method: 'POST' });
        setIsSimulating(false);
      } else {
        await fetch('/api/start_simulation', { method: 'POST' });
        setIsSimulating(true);
      }
    } catch (error) {
      console.error("Failed to toggle simulation:", error);
    }
  };

  return (
    <ThemeProvider>
      <SimulationProvider>
        <Router>
          <div className="flex bg-background min-h-screen text-foreground font-sans selection:bg-cyan-500/30">
            <Sidebar simulationStatus={isSimulating} toggleSimulation={toggleSimulation} />

            <main className="flex-1 ml-64 p-8 overflow-y-auto h-screen relative">
              <Routes>
                <Route path="/" element={<Dashboard isSimulating={isSimulating} toggleSimulation={toggleSimulation} />} />
                <Route path="/comparison" element={<Comparison />} />
                <Route path="/settings" element={<Settings />} />
                <Route path="/threats" element={<Threats />} />
                <Route path="/analysis" element={<Analysis />} />
                <Route path="*" element={<Navigate to="/" replace />} />
              </Routes>
            </main>
          </div>
        </Router>
      </SimulationProvider>
    </ThemeProvider>
  )
}

export default App
