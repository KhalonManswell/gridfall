import { useState } from 'react'
import { Activity, ArrowRight, CheckCheck, ChevronRight, CircleAlert, HardHat, ListOrdered, Radio, ShieldCheck, Wrench } from 'lucide-react'
import { formatTime } from '../simulation/engine'
import type { RepairSuggestion, SimulationEvent } from '../simulation/types'

interface RepairProps {
  suggestions: RepairSuggestion[]
  hasRun: boolean
  onSelect: (id: string) => void
  onRepair: (id: string) => void
}

export function RepairQueue({ suggestions, hasRun, onSelect, onRepair }: RepairProps) {
  return <section className="repair-panel panel">
    <div className="panel-header"><div className="flex items-center gap-2.5"><ListOrdered size={17} /><h2>Restoration priorities</h2></div><span className="subtle-badge">IMPACT RANKED</span></div>
    {suggestions.length ? <ol className="repair-list">{suggestions.map((suggestion, i) => <li key={suggestion.node.id}>
      <span className={`repair-rank ${i === 0 ? 'first' : ''}`}>{String(i + 1).padStart(2, '0')}</span>
      <button className="repair-detail" onClick={() => onSelect(suggestion.node.id)} aria-label={`Inspect suggested repair ${suggestion.node.name}`}><strong>{suggestion.node.name}<ChevronRight size={12} /></strong><span>{suggestion.populationRestored ? `${(suggestion.populationRestored / 1000).toLocaleString('en-US')}k residents` : '0 residents'}<i />{suggestion.criticalRestored} critical restored</span></button>
      <button className="deploy-button" disabled={!suggestion.affordable} onClick={() => onRepair(suggestion.node.id)} aria-label={`Deploy ${suggestion.node.crewsRequired} crew${suggestion.node.crewsRequired > 1 ? 's' : ''} to ${suggestion.node.name}`}><HardHat size={13} />{suggestion.node.crewsRequired}<ArrowRight size={13} /></button>
    </li>)}</ol> : <div className="empty-priorities"><div className="empty-icon"><ShieldCheck size={24} /></div><div><h3>{hasRun ? 'Every asset. Back online.' : 'A resilient grid starts here.'}</h3><p>{hasRun ? 'All physical damage has been repaired. Reset or run another scenario to explore a different strategy.' : 'Run a disaster scenario to uncover vulnerabilities and reveal the highest-impact repairs.'}</p></div></div>}
    <div className="queue-footer"><span className="status-dot" />Critical services + residents restored, weighted per crew</div>
  </section>
}

export function EventLog({ events, onSelect }: { events: SimulationEvent[]; onSelect: (id: string) => void }) {
  const [filter, setFilter] = useState('all')
  const filtered = events.filter(e => filter === 'all' || (filter === 'damage' ? e.kind === 'failure' || e.kind === 'cascade' : e.kind === 'repair' || e.kind === 'success')).reverse()
  return <section className="events-panel panel" aria-labelledby="event-log-title">
    <div className="panel-header"><div className="flex items-center gap-2.5"><Activity size={16} /><h2 id="event-log-title">Incident timeline</h2><span className="event-count">{events.length}</span></div><select aria-label="Filter event log" value={filter} onChange={e => setFilter(e.target.value)}><option value="all">All events</option><option value="damage">Failures & cascades</option><option value="repairs">Repairs & restorations</option></select></div>
    <div className="event-list" tabIndex={0} role="region" aria-label="Time-stamped simulation events">
      {filtered.map(event => {
        const Icon = event.kind === 'failure' ? CircleAlert : event.kind === 'cascade' ? Radio : event.kind === 'repair' ? Wrench : event.kind === 'success' ? CheckCheck : Activity
        const content = <><time>{formatTime(event.time)}</time><span className={`event-icon ${event.kind}`}><Icon size={13} /></span><span className="event-message">{event.message}</span>{event.nodeId && <ChevronRight size={12} className="event-arrow" />}</>
        return event.nodeId ? <button key={event.id} className="event-row" onClick={() => onSelect(event.nodeId!)} aria-label={`${event.message} Inspect asset.`}>{content}</button> : <div key={event.id} className="event-row">{content}</div>
      })}
      {!filtered.length && <p className="no-events">No events in this category yet.</p>}
    </div>
    <div className="events-footer"><span><i className="status-dot" />EXERCISE FEED</span><span>Simulation time · AST</span></div>
  </section>
}
