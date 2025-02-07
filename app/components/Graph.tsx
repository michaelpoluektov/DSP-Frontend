import { theme } from "../styles/theme"
import type { Graph as GraphType } from "../types/graph"

interface GraphProps {
  graph: GraphType
  isBottomContainerOpen?: boolean
}

export default function Graph({ graph, isBottomContainerOpen = false }: GraphProps) {
  return (
    <div className={`flex-1 ${theme.colors.primary} ${theme.spacing.md} overflow-auto scrollbar-hidden relative`}>
      <h2
        className={`${theme.fonts.subtitle} ${theme.colors.text.primary} ${theme.emphasis.background} ${theme.emphasis.padding} ${theme.rounded} ${theme.textEffect.shadow} mb-4`}
      >
        {graph.name}
      </h2>
      <div className="flex-1 min-h-[300px] relative">
        <p className={`${theme.colors.text.secondary}`}>Graph visualization placeholder</p>
      </div>
      <div
        className={`absolute ${isBottomContainerOpen ? 'bottom-36' : 'bottom-4'} right-4 bg-white/90 backdrop-blur-sm ${theme.spacing.md} ${theme.rounded} ${theme.borderWidth} ${theme.colors.border} ${theme.shadow} max-w-xs transition-all duration-200 ease-in-out hover:scale-105`}
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

