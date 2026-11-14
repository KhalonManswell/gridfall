import { ArrowUpRight, HardHat, ShieldAlert, Users, Zap } from 'lucide-react'
import type { GridMetrics } from '../simulation/types'

export function Metrics({ metrics }: { metrics: GridMetrics }) {
  return <section className="metrics-grid grid grid-cols-2 gap-4 xl:grid-cols-4" aria-label="Network statistics">
    <article className={`metric-card availability-card ${metrics.availability < 50 ? 'metric-danger' : ''}`}>
      <div className="metric-label"><span>Grid availability</span><Zap size={16} /></div>
      <div className="metric-value">{metrics.availability}<span>%</span><span className="metric-tag">{metrics.availability === 100 ? 'OPTIMAL' : 'DEGRADED'}</span></div>
      <div className="availability-segments" aria-hidden="true">{Array.from({ length: metrics.total }, (_, i) => <i key={i} className={i < metrics.operational ? 'is-on' : ''} />)}</div>
      <div className="metric-foot">{metrics.operational} of {metrics.total} assets operational</div>
    </article>
    <article className={`metric-card ${metrics.affectedPopulation ? 'has-impact' : ''}`}>
      <div className="metric-label"><span>Affected population</span><Users size={17} /></div>
      <div className="metric-value" data-testid="affected-population">{metrics.affectedPopulation.toLocaleString('en-US')}</div>
      <div className="metric-foot"><span className={`status-dot ${metrics.affectedPopulation ? 'red' : ''}`} />{metrics.affectedPopulation ? 'Residents without essential services' : 'All communities connected'}</div>
    </article>
    <article className={`metric-card ${metrics.criticalOffline ? 'has-impact' : ''}`}>
      <div className="metric-label"><span>Critical facilities offline</span><ShieldAlert size={17} /></div>
      <div className="metric-value">{String(metrics.criticalOffline).padStart(2, '0')}<span className="metric-denominator">/ 04</span></div>
      <div className="metric-foot"><span className={`status-dot ${metrics.criticalOffline ? 'red' : ''}`} />Hospitals & water treatment</div>
    </article>
    <article className="metric-card">
      <div className="metric-label"><span>Repair crews available</span><HardHat size={17} /></div>
      <div className="metric-value">{String(metrics.crewsAvailable).padStart(2, '0')}<span className="metric-denominator">/ 03</span><div className="crew-icons" aria-hidden="true">{[0, 1, 2].map(i => <span key={i} className={i < metrics.crewsAvailable ? 'available' : ''}><HardHat size={16} /></span>)}</div></div>
      <div className="metric-foot">{metrics.crewsAvailable === 3 ? <><ArrowUpRight size={13} /> Ready for deployment</> : <>{3 - metrics.crewsAvailable} committed until exercise reset</>}</div>
    </article>
  </section>
}
