import { Menu } from "lucide-react"
import { useState, useCallback, useMemo } from "react"
import { commonStyles } from "../../styles/common"
import { theme } from "../../styles/theme"
import { type Graph } from "../../types/graph"
import RecordControl from "./RecordControl"
import PlaybackControl from "./PlaybackControl"

interface TopBarProps {
  onToggleSidebar: () => void
  graph: Graph
}

export default function TopBar({ onToggleSidebar, graph }: TopBarProps) {
  // Store recordings as a map of input name to audio blob
  const [recordings, setRecordings] = useState<Record<string, Blob>>({})
  
  // MediaRecorder instances for each input
  const [recorders, setRecorders] = useState<Record<string, MediaRecorder>>({})

  // Store audio streams for visualization
  const [audioStreams, setAudioStreams] = useState<Record<string, MediaStream>>({})

  // Store audio elements for playback
  const [audioElements, setAudioElements] = useState<Record<string, HTMLAudioElement>>({})
  
  // Track which inputs are currently playing
  const [playingInputs, setPlayingInputs] = useState<Record<string, boolean>>({})

  // Check if all inputs have recordings
  const hasAllRecordings = useMemo(() => {
    return graph.inputs.every(input => recordings[input.name])
  }, [recordings, graph.inputs])

  const startRecording = useCallback(async (inputName: string) => {
    try {
      // Request microphone access
      const stream = await navigator.mediaDevices.getUserMedia({ audio: true })
      
      // Store the stream for visualization
      setAudioStreams(prev => ({ ...prev, [inputName]: stream }))
      
      // Create new MediaRecorder instance
      const recorder = new MediaRecorder(stream)
      const chunks: BlobPart[] = []
      
      recorder.ondataavailable = (e) => {
        if (e.data.size > 0) {
          chunks.push(e.data)
        }
      }
      
      recorder.onstop = () => {
        const blob = new Blob(chunks, { type: 'audio/webm' })
        setRecordings(prev => ({ ...prev, [inputName]: blob }))
        
        // Clean up the stream tracks and remove from state
        stream.getTracks().forEach(track => track.stop())
        setAudioStreams(prev => {
          const newStreams = { ...prev }
          delete newStreams[inputName]
          return newStreams
        })
      }
      
      // Store recorder instance
      setRecorders(prev => ({ ...prev, [inputName]: recorder }))
      
      // Start recording
      recorder.start()
    } catch (error) {
      console.error('Error starting recording:', error)
    }
  }, [])

  const stopRecording = useCallback((inputName: string) => {
    const recorder = recorders[inputName]
    if (recorder && recorder.state === 'recording') {
      recorder.stop()
      setRecorders(prev => {
        const newRecorders = { ...prev }
        delete newRecorders[inputName]
        return newRecorders
      })
    }
  }, [recorders])

  const startPlayback = useCallback((inputName: string) => {
    const blob = recordings[inputName]
    if (!blob) return

    // Create a new audio element if we don't have one for this input
    let audioElement = audioElements[inputName]
    if (!audioElement) {
      audioElement = new Audio(URL.createObjectURL(blob))
      setAudioElements(prev => ({ ...prev, [inputName]: audioElement }))
    }

    audioElement.play()
    setPlayingInputs(prev => ({ ...prev, [inputName]: true }))

    // When playback ends
    audioElement.onended = () => {
      setPlayingInputs(prev => ({ ...prev, [inputName]: false }))
    }
  }, [recordings, audioElements])

  const stopPlayback = useCallback((inputName: string) => {
    const audioElement = audioElements[inputName]
    if (audioElement) {
      audioElement.pause()
      audioElement.currentTime = 0
      setPlayingInputs(prev => ({ ...prev, [inputName]: false }))
    }
  }, [audioElements])

  return (
    <div
      className={`${commonStyles.container.primary} flex justify-between items-center border-t-0 border-x-0 py-2 ${theme.colors.border}`}
    >
      <div className="flex gap-2 items-center flex-1 min-w-0">
        {/* Record (Input) Controls */}
        <div className="flex gap-2 flex-1 min-w-0">
          {graph.inputs.map((input, idx) => (
            <RecordControl 
              key={idx} 
              input={input}
              onStartRecording={() => startRecording(input.name)}
              onStopRecording={() => stopRecording(input.name)}
              isRecording={!!recorders[input.name]}
              audioStream={audioStreams[input.name]}
              recordedBlob={recordings[input.name]}
              onPlay={() => startPlayback(input.name)}
              onStop={() => stopPlayback(input.name)}
              isPlaying={!!playingInputs[input.name]}
            />
          ))}
        </div>

        {/* Playback (Output) Controls - only show when all inputs have recordings */}
        {hasAllRecordings && (
          <div className="flex gap-2 shrink-0">
            {graph.outputs.map((output, idx) => (
              <PlaybackControl key={idx} output={output} />
            ))}
          </div>
        )}
      </div>
      
      <button
        onClick={onToggleSidebar}
        className={commonStyles.button.icon}
      >
        <Menu size={24} />
      </button>
    </div>
  )
} 