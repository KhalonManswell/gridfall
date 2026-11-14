import { useEffect, useRef } from 'react'
import { BookOpen, X } from 'lucide-react'

export function Guide({ onClose }: { onClose: () => void }) {
  const ref = useRef<HTMLDialogElement>(null)
  useEffect(() => { ref.current?.showModal() }, [])
  return <dialog ref={ref} className="guide-dialog" aria-labelledby="guide-title" onCancel={onClose} onClick={event => { if (event.target === event.currentTarget) onClose() }}>
    <div className="guide-header"><BookOpen size={20} /><span className="eyebrow">YOUR FIELD MANUAL</span><button className="icon-button" aria-label="Close simulation guide" onClick={onClose} autoFocus><X size={20} /></button></div>
    <h2 id="guide-title">Think in systems.<br /><span>Restore what matters.</span></h2>
    <p>GRIDFALL is a small, deterministic exercise in infrastructure resilience, inspired by Trinidad & Tobago. Every asset and number is illustrative, not real infrastructure data.</p>
    <ol className="guide-steps">
      <li><span>01</span><div><h3>Choose a scenario. Watch the cascade.</h3><p>Simulation starts a fresh exercise with 3 crews. A community needs both power and water. A node stays offline if any required dependency is offline.</p></div></li>
      <li><span>02</span><div><h3>Inspect the network. Follow the source.</h3><p>Red means physical damage. Amber means a cascading outage. Repair damaged sources, not the downstream assets waiting for them.</p></div></li>
      <li><span>03</span><div><h3>Deploy wisely. Crews are limited.</h3><p>Repairs resolve immediately. Each repair commits 1 or 2 crews until reset or a new scenario. The hurricane cannot be fully repaired with only 3 crews. Repairs advance the illustrative exercise clock by 5 minutes.</p></div></li>
    </ol>
    <div className="guide-math"><h3>How the numbers work</h3><p>Availability is operational assets ÷ 12, rounded to the nearest percent. Affected population counts each offline community once (260,000 residents total). Critical facilities are the 2 hospitals and 2 water plants.</p><p>Repair ranking scores immediate residents restored + 75,000 per critical facility + 2,500 per asset restored, plus 2% of potential downstream impact, divided by crews required. This is a teaching heuristic, not an emergency-management recommendation. Costs are illustrative Trinidad & Tobago dollars.</p></div>
    <button className="button primary w-full" onClick={onClose}>Enter the command center</button>
  </dialog>
}
