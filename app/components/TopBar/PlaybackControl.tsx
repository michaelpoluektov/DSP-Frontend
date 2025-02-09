import { PlayCircle } from "lucide-react"
import { commonStyles } from "../../styles/common"
import { theme } from "../../styles/theme"
import type { Output } from "../../types/graph"

interface PlaybackControlProps {
  output: Output
}

export default function PlaybackControl({ output }: PlaybackControlProps) {
  return (
    <div className="flex items-center gap-2">
      <button className={`${commonStyles.button.icon} ${theme.colors.border} p-1.5`}>
        <PlayCircle size={24} />
      </button>
      <span className="text-base flex items-center gap-1.5">
        {output.name}
        {output.input.length === 1 ? (
          <span title="Mono" className="w-2.5 h-2.5 bg-gray-500 rounded-full inline-block"></span>
        ) : (
          <span title="Stereo" className="flex gap-1">
            <span className="w-2.5 h-2.5 bg-gray-500 rounded-full inline-block"></span>
            <span className="w-2.5 h-2.5 bg-gray-500 rounded-full inline-block"></span>
          </span>
        )}
      </span>
    </div>
  )
} 