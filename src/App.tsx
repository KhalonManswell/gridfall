import { useState } from 'react'
import { Activity, ArrowUpRight, BookOpen, ChevronRight, CircleHelp, Clock3, LayoutGrid, Network, Radio, ShieldCheck, Zap } from 'lucide-react'
import { Metrics } from './components/Metrics'
import { ScenarioControl } from './components/ScenarioControl'
import { GridMap } from './components/GridMap'
import { NodeInspector } from './components/NodeInspector'
import { EventLog, RepairQueue } from './components/Operations'
import { Guide } from './components/Guide'
import { NETWORK, SCENARIOS } from './simulation/data'
import { createSimulation, deriveStatuses, formatTime, getMetrics, rankRepairs, repairNode, simulateDisaster } from './simulation/engine'
import type { ScenarioId } from './simulation/types'

export default function App() {
  const [state, setState] = useState(createSimulation)
  const [scenario, setScenario] = useState<ScenarioId>('storm')
  const [selectedId, setSelectedId] = useState('sub-central')
  const [guideOpen, setGuideOpen] = useState(false)
  const statuses = deriveStatuses(state.damagedNodeIds)
  const metrics = getMetrics(state)
  const suggestions = rankRepairs(state)
  const selectedNode = NETWORK.find(n => n.id === selectedId)!
  const activeScenario = SCENARIOS.find(s => s.id === state.scenario)!

  function handleSimulate() {
    const next = simulateDisaster(scenario)
    setState(next)
    setSelectedId(rankRepairs(next)[0]?.node.id ?? 'sub-central')
  }
  function handleRepair(id: string) {
    // Guard queued/double-click events as well as the disabled UI controls.
    setState(current => {
      const node = NETWORK.find(n => n.id === id)
      return node && current.damagedNodeIds.includes(id) && node.crewsRequired <= getMetrics(current).crewsAvailable ? repairNode(current, id) : current
    })
  }
  function handleReset() {
    setState(createSimulation())
    setScenario('storm')
    setSelectedId('sub-central')
  }

  return <div className="app-shell">
    <a className="skip-link" href="#main">Skip to command center</a>
    <aside className="sidebar" aria-label="Command center navigation">
      <a href="#overview" className="brand-mark" aria-label="GRIDFALL overview"><Zap size={25} strokeWidth={2} fill="currentColor" /></a>
      <nav><a href="#overview" className="nav-icon active" aria-label="Command overview" title="Command overview"><LayoutGrid size={20} /></a><a href="#network" className="nav-icon" aria-label="Infrastructure network" title="Infrastructure network"><Network size={20} /></a><a href="#operations" className="nav-icon" aria-label="Restoration and incident timeline" title="Operations timeline"><Activity size={20} /></a><span className="nav-divider" /><button className="nav-icon" aria-label="Open simulation guide" title="Simulation guide" onClick={() => setGuideOpen(true)}><BookOpen size={20} /></button></nav>
      <div className="sidebar-bottom"><button className="nav-icon" aria-label="About this exercise" title="About this exercise" onClick={() => setGuideOpen(true)}><CircleHelp size={20} /></button><span className="operator-avatar" title="Trinidad & Tobago training environment">TT<span /></span></div>
    </aside>
    <div className="workspace">
      <header className="topbar"><a href="#overview" className="wordmark">GRIDFALL<span className="wordmark-dot">.</span></a><span className="topbar-divider" /><span className="product-description">INFRASTRUCTURE CRISIS SIMULATOR</span><div className="topbar-right"><span className="sandbox-badge"><span className="status-dot" />LOCAL SANDBOX</span><span className="topbar-divider" /><span className="country"><i className="tt-flag" />Trinidad & Tobago</span><span className="version">v1.0</span></div></header>
      <main id="main" className="main-content">
        <section id="overview" className="page-intro">
          <div><div className="breadcrumb">OPERATIONS<ChevronRight size={11} /><span>RESILIENCE EXERCISE</span></div><h1>Infrastructure command<span className="heading-dot">.</span></h1><p>One connected island. Every decision has a ripple effect.</p></div>
          <div className="intro-right"><div className="exercise-clock"><Clock3 size={14} /><span>{formatTime(state.events.at(-1)?.time ?? 0)}<small>AST · EXERCISE CLOCK</small></span></div><button className="button guide-button" onClick={() => setGuideOpen(true)}><BookOpen size={14} />Simulation guide<ArrowUpRight size={13} /></button></div>
        </section>
        <div className="illustrative-notice"><ShieldCheck size={13} /><span>A training ground, not a live grid. All assets, populations, costs, and connections are illustrative.</span><span className="notice-badge">SYNTHETIC DATA</span></div>
        <Metrics metrics={metrics} />
        <ScenarioControl selected={scenario} onSelect={setScenario} onSimulate={handleSimulate} onReset={handleReset} />
        <div className="workspace-status"><div><span className={`status-dot ${metrics.availability < 100 ? 'red' : ''}`} /><strong>{state.scenario === 'normal' ? 'Baseline operation' : activeScenario.name}</strong><span className="status-separator">/</span><span>{metrics.availability === 100 ? 'Network stable' : 'Recovery operations active'}</span></div><span><Radio size={12} />DETERMINISTIC SIMULATION</span></div>
        <div className="grid-workspace"><GridMap state={state} statuses={statuses} selectedId={selectedId} onSelect={setSelectedId} /><NodeInspector node={selectedNode} state={state} statuses={statuses} suggestions={suggestions} crewsAvailable={metrics.crewsAvailable} onSelect={setSelectedId} onRepair={handleRepair} /></div>
        <div id="operations" className="operations-grid"><RepairQueue suggestions={suggestions} hasRun={state.events.length > 1} onSelect={setSelectedId} onRepair={handleRepair} /><EventLog events={state.events} onSelect={setSelectedId} /></div>
        <div className="exercise-summary"><span><ShieldCheck size={13} />Repairs resolve instantly. Crews stay committed until reset.</span><span>Repair spend<strong>TT${state.repairSpend.toLocaleString('en-US')}</strong></span></div>
        <footer className="page-footer"><span>GRIDFALL<span>/</span>RESILIENCE THROUGH SYSTEMS THINKING</span><span>BUILT FOR THE WHAT IF.</span></footer>
        <p className="sr-only" role="status" aria-live="polite">Grid availability {metrics.availability} percent. {metrics.affectedPopulation.toLocaleString('en-US')} residents affected. {metrics.criticalOffline} critical facilities offline. {metrics.crewsAvailable} repair crews available.</p>
      </main>
    </div>
    {guideOpen && <Guide onClose={() => setGuideOpen(false)} />}
  </div>
}
