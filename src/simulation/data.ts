import type { InfrastructureNode, NodeType, Scenario } from './types'

/** A fictional teaching network. Names, connections, populations, and costs are illustrative. */
export const NETWORK: InfrastructureNode[] = [
  { id: 'power-west', name: 'Point Lisas Energy', mapLabel: 'POINT LISAS', code: 'PWR-01', type: 'power', region: 'West generation district', x: 255, y: 450, dependencies: [], criticality: 5, population: 0, repairCost: 240000, crewsRequired: 2 },
  { id: 'power-east', name: 'Trinity East Energy', mapLabel: 'TRINITY EAST', code: 'PWR-02', type: 'power', region: 'East generation district', x: 665, y: 445, dependencies: [], criticality: 5, population: 0, repairCost: 210000, crewsRequired: 2 },
  { id: 'sub-north', name: 'Northern Interchange', mapLabel: 'NORTHERN', code: 'SUB-01', type: 'substation', region: 'Northern Range corridor', x: 330, y: 145, dependencies: ['power-west'], criticality: 4, population: 0, repairCost: 85000, crewsRequired: 1 },
  { id: 'sub-central', name: 'Caroni Interchange', mapLabel: 'CARONI', code: 'SUB-02', type: 'substation', region: 'Central transmission corridor', x: 410, y: 325, dependencies: ['power-west'], criticality: 4, population: 0, repairCost: 65000, crewsRequired: 1 },
  { id: 'sub-east', name: 'Eastern Interchange', mapLabel: 'EASTERN', code: 'SUB-03', type: 'substation', region: 'Eastern transmission corridor', x: 615, y: 210, dependencies: ['power-east'], criticality: 4, population: 0, repairCost: 78000, crewsRequired: 1 },
  { id: 'hospital-north', name: 'Port of Spain General', mapLabel: 'PORT OF SPAIN', code: 'MED-01', type: 'hospital', region: 'Northwest medical district', x: 150, y: 130, dependencies: ['sub-north'], criticality: 5, population: 0, repairCost: 45000, crewsRequired: 1 },
  { id: 'hospital-east', name: 'Sangre Grande Medical', mapLabel: 'SANGRE GRANDE', code: 'MED-02', type: 'hospital', region: 'Eastern medical district', x: 790, y: 125, dependencies: ['sub-east'], criticality: 5, population: 0, repairCost: 42000, crewsRequired: 1 },
  { id: 'water-north', name: 'Caroni Water Works', mapLabel: 'CARONI WATER', code: 'WTR-01', type: 'water', region: 'Central water district', x: 255, y: 270, dependencies: ['sub-central'], criticality: 5, population: 0, repairCost: 55000, crewsRequired: 1 },
  { id: 'water-east', name: 'Navet Treatment', mapLabel: 'NAVET WATER', code: 'WTR-02', type: 'water', region: 'Southeast water district', x: 700, y: 315, dependencies: ['sub-east'], criticality: 5, population: 0, repairCost: 38000, crewsRequired: 1 },
  { id: 'community-west', name: 'West Corridor', mapLabel: 'WEST CORRIDOR', code: 'COM-01', type: 'community', region: 'Western residential district', x: 100, y: 320, dependencies: ['sub-north', 'water-north'], criticality: 3, population: 80000, repairCost: 25000, crewsRequired: 1 },
  { id: 'community-central', name: 'Central Boroughs', mapLabel: 'CENTRAL BOROUGHS', code: 'COM-02', type: 'community', region: 'Central residential district', x: 470, y: 470, dependencies: ['sub-central', 'water-north'], criticality: 3, population: 120000, repairCost: 32000, crewsRequired: 1 },
  { id: 'community-east', name: 'East Communities', mapLabel: 'EAST COMMUNITIES', code: 'COM-03', type: 'community', region: 'Eastern residential district', x: 840, y: 365, dependencies: ['sub-east', 'water-east'], criticality: 3, population: 60000, repairCost: 24000, crewsRequired: 1 },
]

export const SCENARIOS: Scenario[] = [
  { id: 'normal', name: 'Normal operation', description: 'Clear skies. All systems operating within normal parameters.', wind: '12 km/h', severity: 'LOW RISK', failedNodeIds: [] },
  { id: 'storm', name: 'Tropical storm', description: 'High winds damage a substation, water facility, and hospital.', wind: '95 km/h', severity: 'ELEVATED RISK', failedNodeIds: ['sub-central', 'water-east', 'hospital-north'] },
  { id: 'hurricane', name: 'Major hurricane', description: 'Severe damage to western generation and the eastern grid.', wind: '210 km/h', severity: 'EXTREME RISK', failedNodeIds: ['power-west', 'sub-east', 'hospital-north'] },
]

export const TYPE_LABELS: Record<NodeType, string> = {
  power: 'Power plant', substation: 'Substation', hospital: 'Hospital', water: 'Water treatment', community: 'Community',
}

export const TOTAL_CREWS = 3
