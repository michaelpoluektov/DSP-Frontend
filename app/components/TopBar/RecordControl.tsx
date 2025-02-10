import { Mic, Play, Square } from "lucide-react"
import { useEffect, useRef, useState } from "react"
import { commonStyles } from "../../styles/common"
import { theme } from "../../styles/theme"
import type { Input } from "../../types/graph"
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from "../ui/tooltip"
import { drawWaveform, drawLiveWaveform, drawEmptyWaveform } from "../../utils/waveform"

interface RecordControlProps {
  input: Input
  onStartRecording: () => void
  onStopRecording: () => void
  isRecording: boolean
  audioStream?: MediaStream
  recordedBlob?: Blob
  onPlay?: () => void
  onStop?: () => void
  isPlaying?: boolean
}

export default function RecordControl({ 
  input, 
  onStartRecording, 
  onStopRecording, 
  isRecording, 
  audioStream, 
  recordedBlob,
  onPlay,
  onStop,
  isPlaying = false
}: RecordControlProps) {
  const canvasRef = useRef<HTMLCanvasElement>(null)
  const containerRef = useRef<HTMLDivElement>(null)
  const animationFrameRef = useRef<number>()
  const analyzerRef = useRef<AnalyserNode | null>(null)
  const audioContextRef = useRef<AudioContext | null>(null)
  const [hasSpace, setHasSpace] = useState(true)

  // Effect to check available space
  useEffect(() => {
    const checkSpace = () => {
      if (containerRef.current) {
        const parentWidth = containerRef.current.parentElement?.getBoundingClientRect().width || 0
        setHasSpace(parentWidth >= 150)
      }
    }

    const resizeObserver = new ResizeObserver(checkSpace)
    if (containerRef.current?.parentElement) {
      resizeObserver.observe(containerRef.current.parentElement)
    }

    // Initial check
    checkSpace()

    return () => resizeObserver.disconnect()
  }, [])

  // Effect to handle live visualization during recording
  useEffect(() => {
    if (canvasRef.current) {
      // Set canvas DPI for sharp rendering
      const canvas = canvasRef.current
      drawEmptyWaveform(canvas)

      if (isRecording && audioStream) {
        // Initialize audio context and analyzer if not already done
        if (!audioContextRef.current) {
          audioContextRef.current = new AudioContext()
          analyzerRef.current = audioContextRef.current.createAnalyser()
          analyzerRef.current.fftSize = 1024
          analyzerRef.current.smoothingTimeConstant = 0.5
        }

        const analyzer = analyzerRef.current
        const audioContext = audioContextRef.current
        if (!analyzer || !audioContext) return

        // Connect the audio stream to the analyzer
        const source = audioContext.createMediaStreamSource(audioStream)
        source.connect(analyzer)

        const draw = () => {
          animationFrameRef.current = requestAnimationFrame(draw)
          drawLiveWaveform(canvas, analyzer)
        }
        
        draw()

        return () => {
          source.disconnect()
        }
      }
    }
    
    return () => {
      if (animationFrameRef.current) {
        cancelAnimationFrame(animationFrameRef.current)
      }
    }
  }, [isRecording, audioStream])

  // Effect to handle visualization of recorded audio
  useEffect(() => {
    if (!isRecording && recordedBlob && canvasRef.current) {
      const visualizeRecording = async () => {
        const audioContext = new AudioContext()
        const arrayBuffer = await recordedBlob.arrayBuffer()
        const audioBuffer = await audioContext.decodeAudioData(arrayBuffer)
        await drawWaveform(audioBuffer, canvasRef.current!)
        audioContext.close()
      }

      visualizeRecording().catch(console.error)
    }
  }, [recordedBlob, isRecording])

  const shouldShowFullControl = isRecording || (recordedBlob && hasSpace)

  const RecordButton = () => (
    <button 
      className={`flex items-center justify-center !w-[18px] !h-[18px] ${commonStyles.button.icon} ${theme.colors.border} ${isRecording ? 'bg-red-500 text-white hover:bg-red-600' : 'bg-white hover:bg-gray-50'} transition-colors`}
      onMouseDown={onStartRecording}
      onMouseUp={onStopRecording}
      onMouseLeave={onStopRecording}
    >
      <Mic className="w-3 h-3" />
    </button>
  )

  const PlaybackButton = () => {
    if (!recordedBlob || !onPlay || !onStop) return null

    return (
      <button 
        className={`flex items-center justify-center !w-[18px] !h-[18px] ${commonStyles.button.icon} ${theme.colors.border} ${isPlaying ? 'bg-gray-200 hover:bg-gray-300' : 'bg-white hover:bg-gray-50'} transition-colors`}
        onClick={isPlaying ? onStop : onPlay}
      >
        {isPlaying ? (
          <Square className="w-2 h-2" />
        ) : (
          <Play className="w-3 h-3" />
        )}
      </button>
    )
  }

  return (
    <div 
      ref={containerRef} 
      className={`relative flex-1 min-w-[36px] transition-all duration-300 ease-in-out`}
    >
      <div className="relative">
        <canvas 
          ref={canvasRef} 
          className={`w-full h-[48px] border-2 bg-gray-100 ${theme.colors.border}`}
          style={{ width: '100%', height: '48px' }}
        />

        <div className="absolute left-1.5 inset-y-0 flex flex-col items-center justify-center" style={{ gap: '3px' }}>
          <TooltipProvider>
            <Tooltip>
              <TooltipTrigger asChild>
                <div>
                  <RecordButton />
                </div>
              </TooltipTrigger>
              {!shouldShowFullControl && (
                <TooltipContent>
                  <p>Record {input.name}</p>
                </TooltipContent>
              )}
            </Tooltip>
          </TooltipProvider>

          <PlaybackButton />
        </div>

        {shouldShowFullControl && (
          <div className="absolute top-1.5 right-1.5 flex items-center gap-1 bg-white/80 px-1">
            <span className="text-[11px] text-gray-600">{input.name}</span>
            <span className="text-[9px] font-mono text-gray-500">
              {input.output.length === 1 ? 'M' : 'S'}
            </span>
          </div>
        )}
      </div>
    </div>
  )
} 