import { ArrowRight, Check, CheckCircle2, ChevronRight, Crosshair, HardHat, Link2, ShieldAlert, Wrench } from 'lucide-react'
import { NETWORK, TYPE_LABELS } from '../simulation/data'
import { downstreamNodes } from '../simulation/engine'
import type { InfrastructureNode, NodeStatus, RepairSuggestion, SimulationState } from '../simulation/types'
import { NodeIcon } from './NodeIcon'

interface Props {
  node: InfrastructureNode
  state: SimulationState
  statuses: Record<string, NodeStatus>
  suggestions: RepairSuggestion[]
  crewsAvailable: number
  onSelect: (id: string) => void
  onRepair: (id: string) => void
}

export function NodeInspector({ node, state, statuses, suggestions, crewsAvailable, onSelect, onRepair }: Props) {
  const status = statuses[node.id]
  const downstream = downstreamNodes(node.id)
  const residents = downstream.reduce((sum, n) => sum + n.population, 0)
  const affectedResidents = downstream.reduce((sum, n) => sum + (statuses[n.id] !== 'operational' ? n.population : 0), 0)
  const suggestion = suggestions.find(s => s.node.id === node.id)
  const source = status === 'isolated' ? suggestions.find(s => downstreamNodes(s.node.id).some(n => n.id === node.id)) : undefined
  const repaired = state.repairedNodeIds.includes(node.id)
  const statusLabel = status === 'operational' ? 'Operational' : status === 'failed' ? 'Physical failure' : 'Cascading outage'

  return <aside className="inspector-panel panel" aria-labelledby="inspector-title">
    <div className="panel-header"><div className="flex items-center gap-2"><Crosshair size={15} /><h2 id="inspector-title">Asset inspector</h2></div><span className="subtle-badge">{node.code}</span></div>
    <div className="inspector-body">
      <div className="asset-type-row"><span className={`asset-icon ${status}`}><NodeIcon type={node.type} size={24} /></span><div><span className="eyebrow">{TYPE_LABELS[node.type]}</span><span className={`asset-status ${status}`}><i />{statusLabel}{repaired && <Check size={12} />}</span></div></div>
      <h3 className="asset-name">{node.name}</h3>
      <p className="asset-region">{node.region}</p>
      <div className="asset-priority"><span>Service priority</span><div className="flex items-center gap-2"><span className="priority-bars" role="img" aria-label={`${node.criticality} out of 5`}>{[1, 2, 3, 4, 5].map(i => <i key={i} className={i <= node.criticality ? 'filled' : ''} />)}</span><strong>{node.criticality === 5 ? 'Critical' : node.criticality === 4 ? 'High' : 'Standard'}</strong></div></div>
      <dl className="asset-details">
        <div><dt>Downstream residents</dt><dd>{residents.toLocaleString('en-US')}</dd></div>
        <div><dt>Currently affected downstream</dt><dd>{affectedResidents.toLocaleString('en-US')}</dd></div>
        <div><dt>Illustrative repair cost</dt><dd>TT${node.repairCost.toLocaleString('en-US')}</dd></div>
        <div><dt>Repair requirement</dt><dd><HardHat size={13} />{node.crewsRequired} crew{node.crewsRequired > 1 ? 's' : ''}</dd></div>
      </dl>
      <div className="dependencies">
        <h4><Link2 size={13} />Upstream dependencies<span>{node.dependencies.length}</span></h4>
        {node.dependencies.length ? node.dependencies.map(id => {
          const dependency = NETWORK.find(n => n.id === id)!
          return <button className="dependency-button" key={id} onClick={() => onSelect(id)} aria-label={`Inspect upstream ${dependency.name}`}><span className={`status-dot ${statuses[id] === 'operational' ? '' : 'red'}`} /><span>{dependency.name}</span><ChevronRight size={14} /></button>
        }) : <p className="independent-source">Independent generation source. No upstream dependencies.</p>}
      </div>
      <div className={`restoration-box ${status}`}>
        {status === 'operational' ? <><div className="restoration-title"><CheckCircle2 size={15} />{repaired ? 'Repair complete. Service restored.' : 'Asset operating normally'}</div><p>No intervention required. Ready to support the network.</p></> : status === 'isolated' ? <><div className="restoration-title"><Link2 size={15} />{repaired ? 'Repaired, awaiting upstream service' : 'Restore the upstream source'}</div><p>No direct repair needed. Service returns when all upstream dependencies are operational.</p>{source && <button className="button secondary w-full" onClick={() => onSelect(source.node.id)}>Inspect source · {source.node.code}<ArrowRight size={14} /></button>}</> : <><div className="restoration-title"><ShieldAlert size={15} />Physical damage confirmed</div><p>{suggestion?.nodesRestored ? `This repair brings ${suggestion.nodesRestored} asset${suggestion.nodesRestored > 1 ? 's' : ''} back online.` : 'Upstream outages must also be repaired to restore service.'}</p><button className="button primary w-full" disabled={node.crewsRequired > crewsAvailable} onClick={() => onRepair(node.id)}><Wrench size={14} />{node.crewsRequired > crewsAvailable ? 'Not enough crews available' : `Assign ${node.crewsRequired} repair crew${node.crewsRequired > 1 ? 's' : ''}`}<ArrowRight size={14} /></button></>}
      </div>
    </div>
    <div className="inspector-footer"><span className="status-dot" />Illustrative assets. Real systems thinking.</div>
  </aside>
}
