export type NodeType = 'power' | 'substation' | 'hospital' | 'water' | 'community'
export type NodeStatus = 'operational' | 'failed' | 'isolated'
export type ScenarioId = 'normal' | 'storm' | 'hurricane'

export interface InfrastructureNode {
  id: string
  name: string
  mapLabel: string
  code: string
  type: NodeType
  region: string
  x: number
  y: number
  dependencies: string[]
  criticality: 1 | 2 | 3 | 4 | 5
  /** Resident counts belong only to communities, so shared dependencies never double-count people. */
  population: number
  repairCost: number
  crewsRequired: number
}

export interface Scenario {
  id: ScenarioId
  name: string
  description: string
  wind: string
  severity: string
  failedNodeIds: string[]
}

export interface SimulationEvent {
  id: number
  time: number
  kind: 'system' | 'failure' | 'cascade' | 'repair' | 'success'
  message: string
  nodeId?: string
}

export interface SimulationState {
  scenario: ScenarioId
  damagedNodeIds: string[]
  repairedNodeIds: string[]
  crewsCommitted: number
  repairSpend: number
  clock: number
  events: SimulationEvent[]
}

export interface GridMetrics {
  operational: number
  total: number
  availability: number
  affectedPopulation: number
  criticalOffline: number
  crewsAvailable: number
}

export interface RepairSuggestion {
  node: InfrastructureNode
  populationRestored: number
  criticalRestored: number
  nodesRestored: number
  score: number
  affordable: boolean
}
