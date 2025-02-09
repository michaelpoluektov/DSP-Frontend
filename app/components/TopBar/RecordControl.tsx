import { Mic, Play, Square } from "lucide-react"
import { useEffect, useRef, useState } from "react"
import { commonStyles } from "../../styles/common"
import { theme } from "../../styles/theme"
import type { Input } from "../../types/graph"
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from "../ui/tooltip"

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

  // Function to draw the waveform from an AudioBuffer
  const drawWaveform = async (audioBuffer: AudioBuffer, canvas: HTMLCanvasElement) => {
    const ctx = canvas.getContext('2d')
    if (!ctx) return

    const dpr = window.devicePixelRatio || 1
    const rect = canvas.getBoundingClientRect()
    
    canvas.width = rect.width * dpr
    canvas.height = rect.height * dpr
    ctx.scale(dpr, dpr)

    ctx.fillStyle = 'rgb(243, 244, 246)' // gray-100
    ctx.fillRect(0, 0, rect.width, rect.height)
    
    // Draw border
    ctx.strokeStyle = theme.colors.xmos.lightTeal
    ctx.lineWidth = 2
    ctx.strokeRect(0, 0, rect.width, rect.height)

    const data = audioBuffer.getChannelData(0)
    const step = Math.ceil(data.length / rect.width)
    const amp = (rect.height - 8) / 2 // Slightly reduced amplitude for gradient space
    const centerY = rect.height / 2

    // Create gradient
    const gradient = ctx.createLinearGradient(0, 4, 0, rect.height - 4)
    gradient.addColorStop(0, theme.colors.xmos.teal)
    gradient.addColorStop(0.5, theme.colors.xmos.lightTeal)
    gradient.addColorStop(1, theme.colors.xmos.teal)

    // Collect points for the waveform
    const points: { x: number; y: number; magnitude: number }[] = []
    
    for (let i = 0; i < rect.width; i++) {
      let min = 1.0
      let max = -1.0
      let sum = 0
      let count = 0
      
      for (let j = 0; j < step; j++) {
        const datum = data[(i * step) + j]
        if (datum < min) min = datum
        if (datum > max) max = datum
        sum += Math.abs(datum)
        count++
      }
      
      const magnitude = sum / count // Average magnitude for this segment
      const x = i
      const y = centerY + ((max + min) / 2) * amp // Use average of min/max for smoother line

      points.push({ x, y, magnitude })
    }

    // Draw the filled waveform with gradient
    ctx.fillStyle = gradient
    ctx.beginPath()
    ctx.moveTo(0, centerY)

    // Draw top curve for fill
    for (let i = 0; i < points.length; i++) {
      const point = points[i]
      const prevPoint = points[i - 1] || point
      const magnitude = Math.min(1, point.magnitude * 2)
      const y = centerY - (magnitude * amp)
      
      if (i === 0) {
        ctx.moveTo(point.x, y)
      } else {
        const cpX = prevPoint.x + (point.x - prevPoint.x) / 2
        ctx.quadraticCurveTo(cpX, centerY - (prevPoint.magnitude * 2 * amp), point.x, y)
      }
    }

    // Draw bottom curve for fill
    for (let i = points.length - 1; i >= 0; i--) {
      const point = points[i]
      const prevPoint = points[i + 1] || point
      const magnitude = Math.min(1, point.magnitude * 2)
      const y = centerY + (magnitude * amp)
      
      if (i === points.length - 1) {
        ctx.lineTo(point.x, y)
      } else {
        const cpX = prevPoint.x + (point.x - prevPoint.x) / 2
        ctx.quadraticCurveTo(cpX, centerY + (prevPoint.magnitude * 2 * amp), point.x, y)
      }
    }

    ctx.closePath()
    ctx.fill()

    // Draw the outline strokes
    ctx.strokeStyle = theme.colors.xmos.teal
    ctx.lineWidth = 1

    // Top outline
    ctx.beginPath()
    for (let i = 0; i < points.length; i++) {
      const point = points[i]
      const prevPoint = points[i - 1] || point
      const magnitude = Math.min(1, point.magnitude * 2)
      const y = centerY - (magnitude * amp)
      
      if (i === 0) {
        ctx.moveTo(point.x, y)
      } else {
        const cpX = prevPoint.x + (point.x - prevPoint.x) / 2
        ctx.quadraticCurveTo(cpX, centerY - (prevPoint.magnitude * 2 * amp), point.x, y)
      }
    }
    ctx.stroke()

    // Bottom outline
    ctx.beginPath()
    for (let i = points.length - 1; i >= 0; i--) {
      const point = points[i]
      const prevPoint = points[i + 1] || point
      const magnitude = Math.min(1, point.magnitude * 2)
      const y = centerY + (magnitude * amp)
      
      if (i === points.length - 1) {
        ctx.moveTo(point.x, y)
      } else {
        const cpX = prevPoint.x + (point.x - prevPoint.x) / 2
        ctx.quadraticCurveTo(cpX, centerY + (prevPoint.magnitude * 2 * amp), point.x, y)
      }
    }
    ctx.stroke()
  }

  // Effect to handle live visualization during recording
  useEffect(() => {
    if (canvasRef.current) {
      // Set canvas DPI for sharp rendering
      const canvas = canvasRef.current
      const ctx = canvas.getContext('2d')
      if (!ctx) return

      const dpr = window.devicePixelRatio || 1
      const rect = canvas.getBoundingClientRect()
      
      canvas.width = rect.width * dpr
      canvas.height = rect.height * dpr
      ctx.scale(dpr, dpr)
      
      // Draw baseline state
      ctx.fillStyle = 'rgb(243, 244, 246)' // gray-100
      ctx.fillRect(0, 0, rect.width, rect.height)
      
      // Draw border
      ctx.strokeStyle = theme.colors.xmos.lightTeal
      ctx.lineWidth = 2
      ctx.strokeRect(0, 0, rect.width, rect.height)
      
      // Draw center line
      ctx.lineWidth = 1.5
      ctx.strokeStyle = theme.colors.xmos.teal
      ctx.beginPath()
      ctx.moveTo(0, rect.height / 2)
      ctx.lineTo(rect.width, rect.height / 2)
      ctx.stroke()
    }

    if (isRecording && canvasRef.current && audioStream) {
      // Initialize audio context and analyzer if not already done
      if (!audioContextRef.current) {
        audioContextRef.current = new AudioContext()
        analyzerRef.current = audioContextRef.current.createAnalyser()
        analyzerRef.current.fftSize = 1024
        analyzerRef.current.smoothingTimeConstant = 0.5
      }

      const analyzer = analyzerRef.current
      const audioContext = audioContextRef.current
      const canvas = canvasRef.current
      const ctx = canvas.getContext('2d')
      if (!ctx || !analyzer || !audioContext) return

      // Connect the audio stream to the analyzer
      const source = audioContext.createMediaStreamSource(audioStream)
      source.connect(analyzer)

      const rect = canvas.getBoundingClientRect()
      const dataArray = new Uint8Array(analyzer.frequencyBinCount)
      
      const draw = () => {
        animationFrameRef.current = requestAnimationFrame(draw)
        analyzer.getByteTimeDomainData(dataArray)
        
        ctx.fillStyle = 'rgb(243, 244, 246)' // gray-100
        ctx.fillRect(0, 0, rect.width, rect.height)
        
        // Draw border
        ctx.strokeStyle = theme.colors.xmos.lightTeal
        ctx.lineWidth = 2
        ctx.strokeRect(0, 0, rect.width, rect.height)
        
        ctx.lineWidth = 1.5
        ctx.strokeStyle = theme.colors.xmos.teal
        ctx.beginPath()
        
        const sliceWidth = rect.width / dataArray.length
        const centerY = rect.height / 2
        let x = 0
        
        for (let i = 0; i < dataArray.length; i++) {
          const v = (dataArray[i] / 128.0) - 1
          const y = centerY + (v * centerY)
          
          if (i === 0) {
            ctx.moveTo(x, y)
          } else {
            const prevX = x - sliceWidth
            const prevY = centerY + (((dataArray[i - 1] / 128.0) - 1) * centerY)
            const cpX = prevX + (x - prevX) / 2
            ctx.quadraticCurveTo(cpX, prevY, x, y)
          }
          
          x += sliceWidth
        }
        
        ctx.stroke()
      }
      
      draw()

      return () => {
        source.disconnect()
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
      className={`relative flex-1 min-w-[36px] transition-all duration-300 ease-in-out ${shouldShowFullControl ? 'max-w-[300px] w-full' : 'max-w-[36px]'}`}
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