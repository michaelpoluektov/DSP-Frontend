import { Mic, Play, Square, Upload } from "lucide-react"
import { useRef, useEffect, useState } from "react"
import { commonStyles } from "../../styles/common"
import { theme } from "../../styles/theme"
import type { Input } from "../../types/graph"
import { Tooltip, TooltipProvider, TooltipTrigger, TooltipContent } from "../ui/tooltip"
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
  onFileUpload?: (file: Blob) => void
}

export default function RecordControl({ 
  input, 
  onStartRecording, 
  onStopRecording, 
  isRecording, 
  recordedBlob,
  onPlay,
  onStop,
  isPlaying = false,
  onFileUpload
}: RecordControlProps) {
  const canvasRef = useRef<HTMLCanvasElement>(null)
  const containerRef = useRef<HTMLDivElement>(null)
  const fileInputRef = useRef<HTMLInputElement>(null)
  const [hasSpace, setHasSpace] = useState(true)
  const [holdTimer, setHoldTimer] = useState<NodeJS.Timeout | null>(null)
  const [isDragging, setIsDragging] = useState(false)
  const [isResizing, setIsResizing] = useState(false)
  const resizeTimeoutRef = useRef<NodeJS.Timeout | null>(null)

  // Effect to check available space
  useEffect(() => {
    const checkSpace = () => {
      if (containerRef.current) {
        // Set resizing state
        setIsResizing(true)
        
        // Clear any existing timeout
        if (resizeTimeoutRef.current) {
          clearTimeout(resizeTimeoutRef.current)
        }

        // Set a new timeout to update space and clear resizing state
        resizeTimeoutRef.current = setTimeout(() => {
          const parentWidth = containerRef.current?.parentElement?.getBoundingClientRect().width || 0
          setHasSpace(parentWidth >= 150)
          setIsResizing(false)
        }, 150) // Wait 150ms after last resize event
      }
    }

    const resizeObserver = new ResizeObserver(checkSpace)
    if (containerRef.current?.parentElement) {
      resizeObserver.observe(containerRef.current.parentElement)
    }

    checkSpace()
    return () => {
      resizeObserver.disconnect()
      if (resizeTimeoutRef.current) {
        clearTimeout(resizeTimeoutRef.current)
      }
    }
  }, [])

  // Effect to handle visualization of recorded audio
  useEffect(() => {
    if (!isRecording && recordedBlob && canvasRef.current && !isResizing) {
      const visualizeRecording = async () => {
        const audioContext = new AudioContext()
        const arrayBuffer = await recordedBlob.arrayBuffer()
        const audioBuffer = await audioContext.decodeAudioData(arrayBuffer)
        await drawWaveform(audioBuffer, canvasRef.current!)
        audioContext.close()
      }

      visualizeRecording().catch(console.error)
    } else if (canvasRef.current && isResizing) {
      // Draw placeholder during resize
      drawEmptyWaveform(canvasRef.current)
    }
  }, [recordedBlob, isRecording, isResizing])

  const shouldShowFullControl = isRecording || (recordedBlob && hasSpace)

  const handleMouseDown = (e: React.MouseEvent) => {
    // Don't handle mouse events if they originated from the buttons
    if ((e.target as HTMLElement).closest('button')) {
      return
    }

    // Start a timer when mouse is pressed
    const timer = setTimeout(() => {
      onStartRecording()
    }, 200) // Wait 200ms before starting recording
    setHoldTimer(timer)
  }

  const handleMouseUp = (e: React.MouseEvent) => {
    // Don't handle mouse events if they originated from the buttons
    if ((e.target as HTMLElement).closest('button')) {
      return
    }

    if (holdTimer) {
      clearTimeout(holdTimer)
      setHoldTimer(null)
    }

    if (isRecording) {
      // If we were recording, stop recording
      onStopRecording()
    } else if (recordedBlob && onPlay && onStop && !isPlaying) {
      // If we weren't recording and have a recording, play it
      onPlay()
    } else if (isPlaying && onStop) {
      // If we're playing, stop playback
      onStop()
    }
  }

  const handleMouseLeave = (e: React.MouseEvent) => {
    // Don't handle mouse events if they originated from the buttons
    if ((e.target as HTMLElement).closest('button')) {
      return
    }

    if (holdTimer) {
      clearTimeout(holdTimer)
      setHoldTimer(null)
    }
    if (isRecording) {
      onStopRecording()
    }
  }

  const handleFileUpload = async (file: File) => {
    if (!onFileUpload) return
    if (!file.type.includes('wav')) {
      console.error('Only WAV files are supported')
      return
    }
    onFileUpload(file)
  }

  const handleDragOver = (e: React.DragEvent) => {
    e.preventDefault()
    e.stopPropagation()
    setIsDragging(true)
  }

  const handleDragLeave = (e: React.DragEvent) => {
    e.preventDefault()
    e.stopPropagation()
    setIsDragging(false)
  }

  const handleDrop = async (e: React.DragEvent) => {
    e.preventDefault()
    e.stopPropagation()
    setIsDragging(false)

    const file = e.dataTransfer.files[0]
    if (file) {
      await handleFileUpload(file)
    }
  }

  const handleUploadClick = (e: React.MouseEvent) => {
    e.stopPropagation()
    fileInputRef.current?.click()
  }

  const handleFileInputChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    if (file) {
      await handleFileUpload(file)
    }
  }

  const MainButton = () => (
    <button 
      className={`flex items-center justify-center !w-[18px] !h-[18px] ${commonStyles.button.icon} ${theme.colors.border} ${
        isPlaying ? 'bg-gray-200 hover:bg-gray-300' : 'bg-white hover:bg-gray-50'
      } transition-colors`}
    >
      {isRecording ? (
        <Mic className="w-3 h-3" />
      ) : isPlaying ? (
        <Square className="w-2 h-2" />
      ) : recordedBlob ? (
        <Play className="w-3 h-3" />
      ) : (
        <Mic className="w-3 h-3" />
      )}
    </button>
  )

  const UploadButton = () => (
    <button 
      className={`flex items-center justify-center !w-[18px] !h-[18px] ${commonStyles.button.icon} ${theme.colors.border} bg-white hover:bg-gray-50 transition-colors`}
      onMouseDown={(e) => {
        e.preventDefault()
        e.stopPropagation()
      }}
      onMouseUp={(e) => {
        e.preventDefault()
        e.stopPropagation()
      }}
      onClick={(e) => {
        e.preventDefault()
        e.stopPropagation()
        fileInputRef.current?.click()
      }}
    >
      <Upload className="w-3 h-3" />
    </button>
  )

  return (
    <div 
      ref={containerRef} 
      className={`relative flex-1 min-w-[36px] transition-all duration-300 ease-in-out group`}
    >
      <div 
        className="relative"
        onMouseDown={handleMouseDown}
        onMouseUp={handleMouseUp}
        onMouseLeave={handleMouseLeave}
        onDragOver={handleDragOver}
        onDragLeave={handleDragLeave}
        onDrop={handleDrop}
      >
        <canvas 
          ref={canvasRef} 
          className={`w-full h-[48px] border-2 bg-gray-100 ${theme.colors.border} ${
            isDragging ? 'border-[#00B6B0]' : 'group-hover:border-[#00B6B0]'
          } transition-colors cursor-pointer`}
          style={{ width: '100%', height: '48px' }}
        />

        <input
          ref={fileInputRef}
          type="file"
          accept=".wav"
          className="hidden"
          onChange={handleFileInputChange}
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
                <p>{recordedBlob ? 'Click to play, hold to record' : 'Hold to record'} {input.name}</p>
              </TooltipContent>
            </Tooltip>
          </TooltipProvider>

          <TooltipProvider>
            <Tooltip>
              <TooltipTrigger asChild>
                <div onClick={(e) => e.stopPropagation()}>
                  <UploadButton />
                </div>
              </TooltipTrigger>
              <TooltipContent>
                <p>Upload audio for {input.name}</p>
              </TooltipContent>
            </Tooltip>
          </TooltipProvider>
        </div>

        <div className="invisible group-hover:visible absolute -bottom-6 left-0 right-0 text-center transition-all duration-200 z-20">
          <div className="inline-block bg-white/90 px-2 py-0.5 rounded-sm shadow-sm">
            <span className="text-[11px] text-gray-600">{input.name}</span>
            <span className="text-[9px] font-mono text-gray-500 ml-1">
              {input.output.length === 1 ? 'M' : 'S'}
            </span>
          </div>
        </div>
      </div>
    </div>
  )
} 