import { Play, Square, Download } from "lucide-react"
import { useRef, useEffect } from "react"
import { commonStyles } from "../../styles/common"
import { theme } from "../../styles/theme"
import type { Output } from "../../types/graph"
import { Tooltip, TooltipProvider, TooltipTrigger, TooltipContent } from "../ui/tooltip"
import { drawWaveform, drawEmptyWaveform } from "../../utils/waveform"

interface PlaybackControlProps {
  output: Output
  processedOutput?: Blob
  onPlay?: () => void
  onStop?: () => void
  isPlaying?: boolean
}

export default function PlaybackControl({ 
  output,
  processedOutput,
  onPlay,
  onStop,
  isPlaying = false
}: PlaybackControlProps) {
  const canvasRef = useRef<HTMLCanvasElement>(null)
  const containerRef = useRef<HTMLDivElement>(null)

  // Effect to handle visualization of processed audio
  useEffect(() => {
    if (canvasRef.current) {
      if (processedOutput) {
        const visualizeAudio = async () => {
          const audioContext = new AudioContext()
          const arrayBuffer = await processedOutput.arrayBuffer()
          const audioBuffer = await audioContext.decodeAudioData(arrayBuffer)
          await drawWaveform(audioBuffer, canvasRef.current!, theme.colors.xmos.purple)
          audioContext.close()
        }

        visualizeAudio().catch(console.error)
      } else {
        drawEmptyWaveform(canvasRef.current)
      }
    }
  }, [processedOutput])

  const handleClick = () => {
    if (!processedOutput || !onPlay || !onStop) return
    
    if (isPlaying) {
      onStop()
    } else {
      onPlay()
    }
  }

  const handleDownload = (e: React.MouseEvent) => {
    e.stopPropagation()
    if (processedOutput) {
      const url = URL.createObjectURL(processedOutput)
      const a = document.createElement('a')
      a.href = url
      a.download = `${output.name}.wav`
      document.body.appendChild(a)
      a.click()
      document.body.removeChild(a)
      URL.revokeObjectURL(url)
    }
  }

  const MainButton = () => {
    if (!processedOutput || !onPlay || !onStop) return null

    return (
      <button 
        className={`flex items-center justify-center !w-[18px] !h-[18px] ${commonStyles.button.icon} ${theme.colors.border} ${
          isPlaying ? 'bg-gray-200 hover:bg-gray-300' : 'bg-white hover:bg-gray-50'
        } transition-colors`}
        onClick={(e) => {
          e.stopPropagation()
          handleClick()
        }}
      >
        {isPlaying ? (
          <Square className="w-2 h-2" />
        ) : (
          <Play className="w-3 h-3" />
        )}
      </button>
    )
  }

  const DownloadButton = () => (
    <button 
      className={`flex items-center justify-center !w-[18px] !h-[18px] ${commonStyles.button.icon} ${theme.colors.border} bg-white hover:bg-gray-50 transition-colors`}
      onClick={handleDownload}
    >
      <Download className="w-3 h-3" />
    </button>
  )

  if (!processedOutput) return null

  return (
    <div 
      ref={containerRef} 
      className="relative flex-1 min-w-[36px] group"
    >
      <div 
        className="relative"
        onClick={handleClick}
      >
        <canvas 
          ref={canvasRef} 
          className={`w-full h-[48px] border-2 bg-gray-100 ${theme.colors.border} group-hover:border-[#00B6B0] transition-colors cursor-pointer`}
          style={{ width: '100%', height: '48px' }}
        />

        <div className="absolute left-1.5 inset-y-0 flex flex-col items-center justify-center gap-1">
          <TooltipProvider>
            <Tooltip>
              <TooltipTrigger asChild>
                <div onClick={(e) => e.stopPropagation()}>
                  <MainButton />
                </div>
              </TooltipTrigger>
              <TooltipContent>
                <p>Play {output.name}</p>
              </TooltipContent>
            </Tooltip>
          </TooltipProvider>

          <TooltipProvider>
            <Tooltip>
              <TooltipTrigger asChild>
                <div onClick={(e) => e.stopPropagation()}>
                  <DownloadButton />
                </div>
              </TooltipTrigger>
              <TooltipContent>
                <p>Download {output.name}</p>
              </TooltipContent>
            </Tooltip>
          </TooltipProvider>
        </div>

        <div className="invisible group-hover:visible absolute -bottom-6 left-0 right-0 text-center transition-all duration-200 z-20">
          <div className="inline-block bg-white/90 px-2 py-0.5 rounded-sm shadow-sm">
            <span className="text-[11px] text-gray-600">{output.name}</span>
            <span className="text-[9px] font-mono text-gray-500 ml-1">
              {output.input.length === 1 ? 'M' : 'S'}
            </span>
          </div>
        </div>
      </div>
    </div>
  )
} 