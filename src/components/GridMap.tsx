import { useState } from 'react'
import { Crosshair, Minus, Plus, Radar, Tags } from 'lucide-react'
import { NETWORK } from '../simulation/data'
import type { NodeStatus, SimulationState } from '../simulation/types'
import { NodeIcon } from './NodeIcon'

const connections = NETWORK.flatMap(node => node.dependencies.map(id => ({ source: NETWORK.find(n => n.id === id)!, target: node })))
const island = 'M111 119 169 100 205 111 252 94 294 101 347 79 394 91 442 81 476 104 531 94 561 113 624 98 662 110 703 94 746 106 772 132 811 143 790 181 808 215 787 246 818 286 801 327 831 362 813 401 765 414 734 442 677 433 637 462 592 451 564 485 523 478 488 501 442 488 409 507 366 479 318 486 301 451 249 460 222 424 178 410 192 374 157 350 170 314 139 286 153 254 132 222 143 192 114 168Z'

interface Props {
  state: SimulationState
  statuses: Record<string, NodeStatus>
  selectedId: string
  onSelect: (id: string) => void
}

export function GridMap({ state, statuses, selectedId, onSelect }: Props) {
  const [showLabels, setShowLabels] = useState(true)
  const [zoom, setZoom] = useState(1)
  const online = Object.values(statuses).filter(s => s === 'operational').length
  const colors = { operational: '#45decc', failed: '#ff6775', isolated: '#eab66d' }

  return <section id="network" className="map-panel panel">
    <div className="panel-header">
      <div className="flex items-center gap-2.5"><Radar size={17} className="text-cyan" /><h2>Network overview</h2><span className="subtle-badge">TT–01</span></div>
      <span className="map-view-label"><span className="status-dot" />SCHEMATIC VIEW</span>
      <select className="mobile-asset-select" aria-label="Inspect network asset" value={selectedId} onChange={event => onSelect(event.target.value)}>{NETWORK.map(node => <option key={node.id} value={node.id}>{node.name}</option>)}</select>
    </div>
    <div className="map-canvas">
      <div className="map-overlay-top"><div className="map-coordinate">ISLAND INFRASTRUCTURE NETWORK<small>12 ASSETS<span />{connections.length} DEPENDENCIES</small></div><span className={`network-health ${online === 12 ? '' : 'degraded'}`}><i />{online === 12 ? 'All systems operational' : `${12 - online} assets offline`}</span></div>
      <svg className="network-svg" viewBox={`${450 - 450 / zoom} ${290 - 290 / zoom} ${900 / zoom} ${580 / zoom}`} aria-label="Interactive synthetic infrastructure network">
        <defs>
          <pattern id="map-dots" width="22" height="22" patternUnits="userSpaceOnUse"><circle cx="1" cy="1" r=".8" fill="#1d323a" /></pattern>
          <radialGradient id="island-glow"><stop offset="0" stopColor="#163333" stopOpacity=".4" /><stop offset="1" stopColor="#0a1119" stopOpacity="0" /></radialGradient>
          <filter id="node-glow" x="-100%" y="-100%" width="300%" height="300%"><feGaussianBlur stdDeviation="6" /></filter>
        </defs>
        <rect width="900" height="580" fill="url(#map-dots)" />
        <ellipse cx="450" cy="290" rx="440" ry="290" fill="url(#island-glow)" />
        <g className="island-contours" aria-hidden="true">
          <path d={island} fill="#0e2025" fillOpacity=".38" stroke="#203b40" strokeWidth="1.2" />
          <path d={island} fill="none" stroke="#1a3037" strokeWidth=".7" transform="translate(450 290) scale(1.035) translate(-450 -290)" />
          <path d={island} fill="none" stroke="#172a32" strokeWidth=".5" transform="translate(450 290) scale(1.075) translate(-450 -290)" />
          <path d="M716 60 732 45 755 41 772 28 797 28 784 42 761 51 747 64 731 63Z" fill="#11242a" stroke="#2b4247" />
          <text x="815" y="44" className="map-region">TOBAGO</text>
          <text x="44" y="430" className="map-water-label" transform="rotate(-90 44 430)">GULF OF PARIA</text>
          <text x="516" y="545" className="map-island-label">TRINIDAD</text>
          <path d="M70 500v-24m-5 7 5-7 5 7" fill="none" stroke="#49616a" strokeWidth="1.2" /><text x="67" y="515" className="map-region">N</text>
        </g>
        <g aria-hidden="true">{connections.map(({ source, target }) => {
          const active = statuses[source.id] === 'operational' && statuses[target.id] === 'operational'
          const selected = source.id === selectedId || target.id === selectedId
          const midY = (source.y + target.y) / 2
          const path = `M ${source.x} ${source.y} C ${source.x} ${midY}, ${target.x} ${midY}, ${target.x} ${target.y}`
          return <g key={`${source.id}-${target.id}`} className={active ? 'connection active' : 'connection offline'}>
            <path d={path} stroke={active ? '#23736d' : '#853e4b'} strokeWidth={selected ? 2 : 1.2} fill="none" opacity={selected ? .95 : .55} strokeDasharray={active ? undefined : '5 6'} />
            {active && <path className="flow-line" d={path} stroke="#63ebd6" strokeWidth={selected ? 2 : 1.4} strokeDasharray="2 26" fill="none" opacity={selected ? .85 : .5} />}
          </g>
        })}</g>
        {NETWORK.map(node => {
          const status = statuses[node.id]
          const selected = selectedId === node.id
          const color = colors[status]
          const repaired = state.repairedNodeIds.includes(node.id)
          return <g key={node.id} transform={`translate(${node.x} ${node.y})`} className={`grid-node ${status} ${selected ? 'is-selected' : ''}`} role="button" tabIndex={0} aria-label={`${node.name}, ${status}${repaired ? ', repaired' : ''}`} aria-pressed={selected} onClick={() => onSelect(node.id)} onKeyDown={event => { if (event.key === 'Enter' || event.key === ' ') { event.preventDefault(); onSelect(node.id) } }}>
            <title>{node.name} · {status} · Click to inspect</title>
            <circle className="node-halo" r="29" fill={color} opacity={selected ? .14 : .05} />
            {selected && <circle r="31" fill="none" stroke={color} strokeWidth="1" strokeDasharray="3 5" opacity=".8" />}
            <rect className="node-base" x="-20" y="-20" width="40" height="40" rx="11" fill={selected ? '#12302f' : '#0b1920'} stroke={color} strokeOpacity={selected ? 1 : .65} strokeWidth={selected ? 1.8 : 1.2} />
            <NodeIcon type={node.type} x={-10} y={-10} width={20} height={20} color={color} strokeWidth={1.6} />
            <circle cx="17" cy="-17" r="4" fill={color} stroke="#0a1119" strokeWidth="2" />
            {showLabels && <g aria-hidden="true"><text y="-35" textAnchor="middle" className="node-code" fill={selected ? color : '#7d929b'}>{node.code}</text><text y="41" textAnchor="middle" className="node-label" fill={selected ? '#ecf9f7' : '#a9bec3'}>{node.mapLabel}</text></g>}
          </g>
        })}
      </svg>
      <div className="map-instruction"><Crosshair size={13} />Select an asset to inspect its dependencies</div>
      <div className="map-tools">
        <button aria-label={showLabels ? 'Hide node labels' : 'Show node labels'} aria-pressed={showLabels} title="Toggle node labels" onClick={() => setShowLabels(s => !s)}><Tags size={15} /></button>
        <span />
        <button aria-label="Zoom out" disabled={zoom <= 1} onClick={() => setZoom(z => Math.max(1, +(z - .15).toFixed(2)))}><Minus size={15} /></button>
        <span className="zoom-level">{Math.round(zoom * 100)}%</span>
        <button aria-label="Zoom in" disabled={zoom >= 1.6} onClick={() => setZoom(z => Math.min(1.6, +(z + .15).toFixed(2)))}><Plus size={15} /></button>
      </div>
    </div>
    <div className="map-footer"><div className="map-legend"><span><i className="legend-dot operational" />Operational</span><span><i className="legend-dot failed" />Physical failure</span><span><i className="legend-dot isolated" />Cascading outage</span></div><span className="map-disclaimer">ILLUSTRATIVE · NOT GEOGRAPHIC</span></div>
  </section>
}
