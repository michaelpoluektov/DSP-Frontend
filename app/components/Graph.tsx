import { theme } from "../styles/theme"
import type { Graph as GraphType } from "../types/graph"

interface GraphProps {
  graph: GraphType
}

export default function Graph({ graph }: GraphProps) {
  return (
    <div className={`flex-1 ${theme.colors.primary} ${theme.spacing.md} overflow-auto scrollbar-hidden relative`}>
      <h2
        className={`${theme.fonts.subtitle} ${theme.colors.text.primary} ${theme.emphasis.background} ${theme.emphasis.padding} ${theme.rounded} ${theme.textEffect.shadow} mb-4`}
      >
        {graph.name}
      </h2>
      <div
        className={`${theme.colors.secondary} ${theme.spacing.lg} ${theme.rounded} ${theme.borderWidth} ${theme.colors.border} ${theme.shadow} min-h-[300px]`}
      >
        <p className={`${theme.colors.text.secondary}`}>Graph visualization placeholder</p>
      </div>
      <div
        className={`absolute bottom-4 right-4 ${theme.colors.secondary} ${theme.spacing.md} ${theme.rounded} ${theme.borderWidth} ${theme.colors.border} ${theme.shadow} max-w-xs`}
      >
        <h3 className={`${theme.fonts.heading} ${theme.colors.text.primary} text-sm mb-2`}>Graph Info</h3>
        <p className={`${theme.colors.text.secondary} text-xs mb-1`}>Nodes: {graph.nodes.length}</p>
        <p className={`${theme.colors.text.secondary} text-xs mb-1`}>Input Channels: {graph.input.channels}</p>
        <p className={`${theme.colors.text.secondary} text-xs mb-1`}>Output Channels: {graph.output.channels}</p>
        <p className={`${theme.colors.text.secondary} text-xs`}>Sample Rate: {graph.input.fs} Hz</p>
      </div>
    </div>
  )
}

