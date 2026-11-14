import { NETWORK, SCENARIOS, TOTAL_CREWS } from './data'
import type { GridMetrics, InfrastructureNode, NodeStatus, RepairSuggestion, ScenarioId, SimulationEvent, SimulationState } from './types'

export function deriveStatuses(damagedNodeIds: readonly string[], network = NETWORK): Record<string, NodeStatus> {
  const damaged = new Set(damagedNodeIds)
  const byId = new Map(network.map(node => [node.id, node]))
  const statuses: Record<string, NodeStatus> = {}
  const visiting = new Set<string>()
  function visit(id: string): NodeStatus {
    if (statuses[id]) return statuses[id]
    const node = byId.get(id)
    if (!node) throw new Error(`Unknown dependency: ${id}`)
    if (visiting.has(id)) throw new Error('Network dependencies must not contain cycles.')
    visiting.add(id)
    // Evaluate every dependency, including on physically damaged nodes.
    const upstream = node.dependencies.map(visit)
    const status = damaged.has(id) ? 'failed' : upstream.some(s => s !== 'operational') ? 'isolated' : 'operational'
    visiting.delete(id)
    statuses[id] = status
    return status
  }
  network.forEach(node => visit(node.id))
  return statuses
}

export function isCritical(node: InfrastructureNode): boolean {
  return node.type === 'hospital' || node.type === 'water'
}

export function getMetrics(state: SimulationState): GridMetrics {
  const statuses = deriveStatuses(state.damagedNodeIds)
  const operational = NETWORK.filter(n => statuses[n.id] === 'operational').length
  return {
    operational, total: NETWORK.length,
    availability: Math.round(operational / NETWORK.length * 100),
    affectedPopulation: NETWORK.reduce((sum, n) => sum + (statuses[n.id] !== 'operational' ? n.population : 0), 0),
    criticalOffline: NETWORK.filter(n => isCritical(n) && statuses[n.id] !== 'operational').length,
    crewsAvailable: TOTAL_CREWS - state.crewsCommitted,
  }
}

export function downstreamNodes(id: string): InfrastructureNode[] {
  const reached = new Set([id])
  let changed = true
  while (changed) {
    changed = false
    for (const node of NETWORK) {
      if (!reached.has(node.id) && node.dependencies.some(dep => reached.has(dep))) {
        reached.add(node.id)
        changed = true
      }
    }
  }
  return NETWORK.filter(n => reached.has(n.id))
}

function appendEvent(state: SimulationState, kind: SimulationEvent['kind'], message: string, nodeId?: string): void {
  state.events.push({ id: state.events.length + 1, time: state.clock, kind, message, nodeId })
  state.clock += 15
}

export function createSimulation(): SimulationState {
  const state: SimulationState = { scenario: 'normal', damagedNodeIds: [], repairedNodeIds: [], crewsCommitted: 0, repairSpend: 0, clock: 0, events: [] }
  appendEvent(state, 'system', 'Command initialized. All 12 infrastructure assets are operational.')
  return state
}

export function simulateDisaster(scenarioId: ScenarioId): SimulationState {
  const scenario = SCENARIOS.find(s => s.id === scenarioId)
  if (!scenario) throw new Error(`Unknown scenario: ${scenarioId}`)
  const state = createSimulation()
  state.scenario = scenarioId
  state.clock = 60
  state.damagedNodeIds = [...scenario.failedNodeIds]
  appendEvent(state, 'system', `${scenario.name} simulation started. Three fresh repair crews mobilized.`)
  for (const node of NETWORK.filter(n => state.damagedNodeIds.includes(n.id))) {
    appendEvent(state, 'failure', `${node.name}: physical damage detected. Direct repair required.`, node.id)
  }
  const statuses = deriveStatuses(state.damagedNodeIds)
  for (const node of NETWORK.filter(n => statuses[n.id] === 'isolated')) {
    const sources = node.dependencies.filter(id => statuses[id] !== 'operational').map(id => NETWORK.find(n => n.id === id)!.name)
    appendEvent(state, 'cascade', `${node.name}: service lost through ${sources.join(' and ')}.`, node.id)
  }
  if (scenarioId === 'normal') appendEvent(state, 'success', 'Baseline verified. No damage or downstream outages.')
  return state
}

export function repairNode(state: SimulationState, nodeId: string): SimulationState {
  const node = NETWORK.find(n => n.id === nodeId)
  if (!node) throw new Error('Unknown infrastructure asset.')
  if (!state.damagedNodeIds.includes(nodeId)) throw new Error('Only physically damaged nodes need direct repair.')
  if (state.crewsCommitted + node.crewsRequired > TOTAL_CREWS) throw new Error('Not enough repair crews available. Reset or start a new scenario.')
  const before = deriveStatuses(state.damagedNodeIds)
  const next: SimulationState = {
    ...state, events: [...state.events], clock: state.clock + 300,
    damagedNodeIds: state.damagedNodeIds.filter(id => id !== nodeId),
    repairedNodeIds: [...state.repairedNodeIds, nodeId],
    crewsCommitted: state.crewsCommitted + node.crewsRequired,
    repairSpend: state.repairSpend + node.repairCost,
  }
  const after = deriveStatuses(next.damagedNodeIds)
  appendEvent(next, 'repair', `${node.name}: physical repair complete. ${node.crewsRequired} crew${node.crewsRequired > 1 ? 's' : ''} committed; TT$${node.repairCost.toLocaleString('en-US')} spent.`, nodeId)
  for (const restored of NETWORK.filter(n => before[n.id] !== 'operational' && after[n.id] === 'operational')) {
    appendEvent(next, 'success', `${restored.name}: service restored${restored.id !== nodeId ? ' through upstream repair' : ''}.`, restored.id)
  }
  if (after[nodeId] === 'isolated') appendEvent(next, 'cascade', `${node.name}: repaired, but still awaiting upstream service.`, nodeId)
  if (next.damagedNodeIds.length === 0) appendEvent(next, 'success', 'Full network recovery confirmed. All 12 assets are operational.')
  return next
}

export function rankRepairs(state: SimulationState): RepairSuggestion[] {
  const before = getMetrics(state)
  return NETWORK.filter(n => state.damagedNodeIds.includes(n.id)).map(node => {
    const after = getMetrics({ ...state, damagedNodeIds: state.damagedNodeIds.filter(id => id !== node.id) })
    const populationRestored = before.affectedPopulation - after.affectedPopulation
    const criticalRestored = before.criticalOffline - after.criticalOffline
    const nodesRestored = after.operational - before.operational
    const downstream = downstreamNodes(node.id)
    // Immediate critical-service recovery dominates; a small downstream term breaks blocked-repair ties.
    const potential = downstream.reduce((sum, n) => sum + n.population + (isCritical(n) ? 75000 : 0), 0)
    const score = (populationRestored + criticalRestored * 75000 + nodesRestored * 2500 + potential * 0.02) / node.crewsRequired
    return { node, populationRestored, criticalRestored, nodesRestored, score, affordable: node.crewsRequired <= before.crewsAvailable }
  }).sort((a, b) => b.score - a.score || a.node.id.localeCompare(b.node.id))
}

export function formatTime(seconds: number): string {
  return new Date(Date.UTC(2026, 7, 18, 14, 0, seconds)).toISOString().slice(11, 19)
}
