import { CloudLightning, Play, RotateCcw, Sun, Wind } from 'lucide-react'
import { SCENARIOS } from '../simulation/data'
import type { ScenarioId } from '../simulation/types'

const icons = { normal: Sun, storm: CloudLightning, hurricane: Wind }

interface Props {
  selected: ScenarioId
  onSelect: (id: ScenarioId) => void
  onSimulate: () => void
  onReset: () => void
}

export function ScenarioControl({ selected, onSelect, onSimulate, onReset }: Props) {
  const current = SCENARIOS.find(s => s.id === selected)!
  return <section className="scenario-panel panel" aria-labelledby="scenario-title">
    <div className="scenario-intro">
      <span className="eyebrow">THE STRESS TEST</span>
      <h2 id="scenario-title">Choose your scenario</h2>
    </div>
    <div className="scenario-options" role="group" aria-label="Disaster scenario">
      {SCENARIOS.map(s => {
        const Icon = icons[s.id]
        return <button key={s.id} aria-pressed={selected === s.id} onClick={() => onSelect(s.id)} className={`scenario-option ${selected === s.id ? `selected ${s.id}` : ''}`}>
          <Icon size={18} /><span>{s.name}<small>{s.wind} winds</small></span><span className="radio-indicator" />
        </button>
      })}
    </div>
    <div className="scenario-actions">
      <button className="button primary" onClick={onSimulate} title={`${current.description} Starts a new exercise with three fresh crews.`}><Play size={14} fill="currentColor" />Simulate Disaster</button>
      <button className="reset-button" onClick={onReset}><RotateCcw size={13} />Reset Simulation</button>
    </div>
  </section>
}
