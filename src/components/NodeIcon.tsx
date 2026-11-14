import { Building2, Droplets, HeartPulse, UtilityPole, Zap } from 'lucide-react'
import type { LucideProps } from 'lucide-react'
import type { NodeType } from '../simulation/types'

const icons = { power: Zap, substation: UtilityPole, hospital: HeartPulse, water: Droplets, community: Building2 }

export function NodeIcon({ type, ...props }: LucideProps & { type: NodeType }) {
  const Icon = icons[type]
  return <Icon {...props} />
}
