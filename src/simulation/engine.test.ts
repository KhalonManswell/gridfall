import { describe, expect, it } from 'vitest'
import { NETWORK } from './data'
import { createSimulation, deriveStatuses, downstreamNodes, getMetrics, rankRepairs, repairNode, simulateDisaster } from './engine'

describe('dependency propagation', () => {
  it('starts with all 12 assets online and three crews', () => {
    expect(getMetrics(createSimulation())).toEqual({ operational: 12, total: 12, availability: 100, affectedPopulation: 0, criticalOffline: 0, crewsAvailable: 3 })
  })
  it('propagates generator failure transitively without affecting the independent east grid', () => {
    const statuses = deriveStatuses(['power-west'])
    expect(statuses['power-west']).toBe('failed')
    expect(statuses['sub-central']).toBe('isolated')
    expect(statuses['water-north']).toBe('isolated')
    expect(statuses['community-central']).toBe('isolated')
    expect(statuses['hospital-east']).toBe('operational')
    expect(Object.values(statuses).filter(s => s !== 'operational')).toHaveLength(7)
  })
  it('requires both power and water for a community', () => {
    const statuses = deriveStatuses(['water-north'])
    expect(statuses['sub-north']).toBe('operational')
    expect(statuses['community-west']).toBe('isolated')
    expect(statuses['community-central']).toBe('isolated')
  })
  it('rejects cycles and missing upstream dependencies', () => {
    expect(() => deriveStatuses([], [{ ...NETWORK[0], dependencies: ['power-west'] }])).toThrow('cycles')
    expect(() => deriveStatuses([], [{ ...NETWORK[0], dependencies: ['missing'] }])).toThrow('Unknown dependency')
  })
})

describe('impact calculations', () => {
  it('counts affected residents once even when both power and water fail', () => {
    const storm = simulateDisaster('storm')
    expect(getMetrics(storm)).toEqual({ operational: 5, total: 12, availability: 42, affectedPopulation: 260000, criticalOffline: 3, crewsAvailable: 3 })
  })
  it('has deterministic hurricane damage and correctly counts critical facilities', () => {
    expect(simulateDisaster('hurricane')).toEqual(simulateDisaster('hurricane'))
    expect(getMetrics(simulateDisaster('hurricane'))).toEqual({ operational: 1, total: 12, availability: 8, affectedPopulation: 260000, criticalOffline: 4, crewsAvailable: 3 })
  })
  it('does not duplicate downstream residents across multiple paths', () => {
    expect(downstreamNodes('power-west').reduce((sum, n) => sum + n.population, 0)).toBe(200000)
  })
  it('prioritizes high-impact restoration over a single facility', () => {
    const suggestions = rankRepairs(simulateDisaster('storm'))
    expect(suggestions.map(s => s.node.id)).toEqual(['sub-central', 'water-east', 'hospital-north'])
    expect(suggestions[0].populationRestored).toBe(200000)
    expect(suggestions[0].nodesRestored).toBe(4)
    expect(suggestions[0].criticalRestored).toBe(1)
  })
})

describe('restoration and crew allocation', () => {
  it('restores dependent services immediately and preserves the previous state', () => {
    const before = simulateDisaster('storm')
    const after = repairNode(before, 'sub-central')
    expect(getMetrics(after)).toMatchObject({ operational: 9, availability: 75, affectedPopulation: 60000, criticalOffline: 2, crewsAvailable: 2 })
    expect(after.repairSpend).toBe(65000)
    expect(before.damagedNodeIds).toHaveLength(3)
    expect(before.crewsCommitted).toBe(0)
  })
  it('fully restores the tropical storm with exactly three crews', () => {
    let state = simulateDisaster('storm')
    for (const id of ['sub-central', 'water-east', 'hospital-north']) state = repairNode(state, id)
    expect(getMetrics(state)).toMatchObject({ availability: 100, affectedPopulation: 0, criticalOffline: 0, crewsAvailable: 0 })
    expect(state.repairSpend).toBe(148000)
    expect(state.events.at(-1)?.message).toContain('Full network recovery')
  })
  it('keeps a physically repaired asset isolated until its upstream source is repaired', () => {
    const state = repairNode(simulateDisaster('hurricane'), 'hospital-north')
    expect(deriveStatuses(state.damagedNodeIds)['hospital-north']).toBe('isolated')
    expect(getMetrics(state).operational).toBe(1)
    const next = repairNode(state, 'power-west')
    expect(deriveStatuses(next.damagedNodeIds)['hospital-north']).toBe('operational')
    expect(getMetrics(next).crewsAvailable).toBe(0)
  })
  it('rejects overspending crews, double repairs, and repairs of cascade-only outages', () => {
    const state = repairNode(repairNode(simulateDisaster('hurricane'), 'power-west'), 'sub-east')
    expect(() => repairNode(state, 'hospital-north')).toThrow('Not enough repair crews')
    expect(() => repairNode(state, 'power-west')).toThrow('Only physically damaged')
    expect(() => repairNode(simulateDisaster('storm'), 'community-west')).toThrow('Only physically damaged')
    expect(() => repairNode(state, 'unknown')).toThrow('Unknown infrastructure')
  })
  it('starts each new scenario with fresh crews and resets all damage and spend', () => {
    const repaired = repairNode(simulateDisaster('storm'), 'sub-central')
    expect(repaired.repairSpend).toBeGreaterThan(0)
    expect(simulateDisaster('normal').damagedNodeIds).toEqual([])
    expect(getMetrics(createSimulation()).crewsAvailable).toBe(3)
    expect(createSimulation().repairSpend).toBe(0)
  })
  it('records failures, cascading outages, and repairs with monotonic timestamps', () => {
    const state = repairNode(simulateDisaster('storm'), 'sub-central')
    expect(new Set(state.events.map(e => e.kind))).toEqual(new Set(['system', 'failure', 'cascade', 'repair', 'success']))
    expect(state.events.every((event, i) => i === 0 || event.time > state.events[i - 1].time)).toBe(true)
  })
})
