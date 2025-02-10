import { Menu } from "lucide-react"
import { useState, useCallback, useMemo, useEffect } from "react"
import { commonStyles } from "@/styles/common"
import { theme } from "@/styles/theme"
import { type Graph } from "@/types/graph"
import RecordControl from "@/components/TopBar/RecordControl"
import PlaybackControl from "@/components/TopBar/PlaybackControl"
import { processAudio } from "@/utils/api"
import JSZip from "jszip"

// Function to convert audio blob to WAV format
async function convertToWav(audioBlob: Blob): Promise<Blob> {
  const audioContext = new AudioContext()
  const arrayBuffer = await audioBlob.arrayBuffer()
  const audioBuffer = await audioContext.decodeAudioData(arrayBuffer)
  
  // Create an offline context to render the audio
  const offlineContext = new OfflineAudioContext(
    audioBuffer.numberOfChannels,
    audioBuffer.length,
    audioBuffer.sampleRate
  )
  
  // Create a buffer source
  const source = offlineContext.createBufferSource()
  source.buffer = audioBuffer
  source.connect(offlineContext.destination)
  source.start()

  // Render the audio
  const renderedBuffer = await offlineContext.startRendering()

  // Convert to 16-bit PCM
  const bytesPerSample = 2
  const wavBytes = new Int16Array(renderedBuffer.length * renderedBuffer.numberOfChannels)
  
  for (let channel = 0; channel < renderedBuffer.numberOfChannels; channel++) {
    const channelData = renderedBuffer.getChannelData(channel)
    for (let i = 0; i < renderedBuffer.length; i++) {
      // Convert float32 to int16
      const index = i * renderedBuffer.numberOfChannels + channel
      const sample = Math.max(-1, Math.min(1, channelData[i])) // Clamp between -1 and 1
      wavBytes[index] = sample < 0 
        ? sample * 0x8000 
        : sample * 0x7FFF // Convert to 16-bit
    }
  }

  // Create WAV header
  const wavHeader = createWavHeader(
    renderedBuffer.length * renderedBuffer.numberOfChannels * bytesPerSample,
    renderedBuffer.numberOfChannels,
    renderedBuffer.sampleRate
  )

  // Combine header and audio data
  const wavBlob = new Blob([wavHeader, wavBytes.buffer], { type: 'audio/wav' })
  return wavBlob
}

// Function to create a WAV header
function createWavHeader(dataLength: number, numChannels: number, sampleRate: number): ArrayBuffer {
  const header = new ArrayBuffer(44)
  const view = new DataView(header)

  // "RIFF" chunk descriptor
  writeString(view, 0, 'RIFF')
  view.setUint32(4, 36 + dataLength, true)
  writeString(view, 8, 'WAVE')

  // "fmt " sub-chunk
  writeString(view, 12, 'fmt ')
  view.setUint32(16, 16, true) // fmt chunk size
  view.setUint16(20, 1, true) // format (1 = PCM)
  view.setUint16(22, numChannels, true)
  view.setUint32(24, sampleRate, true)
  view.setUint32(28, sampleRate * numChannels * 2, true) // byte rate (2 bytes per sample)
  view.setUint16(32, numChannels * 2, true) // block align
  view.setUint16(34, 16, true) // bits per sample

  // "data" sub-chunk
  writeString(view, 36, 'data')
  view.setUint32(40, dataLength, true)

  return header
}

// Helper function to write strings to DataView
function writeString(view: DataView, offset: number, string: string) {
  for (let i = 0; i < string.length; i++) {
    view.setUint8(offset + i, string.charCodeAt(i))
  }
}

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

  // Store processed outputs
  const [processedOutputs, setProcessedOutputs] = useState<Record<string, Blob>>({})
  // Track which outputs are currently playing
  const [playingOutputs, setPlayingOutputs] = useState<Record<string, boolean>>({})
  // Store audio elements for output playback
  const [outputAudioElements, setOutputAudioElements] = useState<Record<string, HTMLAudioElement>>({})

  // Check if all inputs have recordings
  const hasAllRecordings = useMemo(() => {
    return graph.inputs.every(input => recordings[input.name])
  }, [recordings, graph.inputs])

  // Update input audio elements whenever recordings change
  useEffect(() => {
    // Stop any playing audio
    Object.values(audioElements).forEach(audio => {
      audio.pause()
      audio.currentTime = 0
    })
    setPlayingInputs({})

    // Create new audio elements for each recording
    const newAudioElements: Record<string, HTMLAudioElement> = {}
    Object.entries(recordings).forEach(([name, blob]) => {
      newAudioElements[name] = new Audio(URL.createObjectURL(blob))
    })
    setAudioElements(newAudioElements)
  }, [recordings])

  // Update output audio elements whenever processed outputs change
  useEffect(() => {
    // Stop any playing audio
    Object.values(outputAudioElements).forEach(audio => {
      audio.pause()
      audio.currentTime = 0
    })
    setPlayingOutputs({})

    // Create new audio elements for each output
    const newAudioElements: Record<string, HTMLAudioElement> = {}
    Object.entries(processedOutputs).forEach(([name, blob]) => {
      newAudioElements[name] = new Audio(URL.createObjectURL(blob))
    })
    setOutputAudioElements(newAudioElements)
  }, [processedOutputs])

  const processRecordings = useCallback(async () => {
    if (!hasAllRecordings) return

    try {
      // Convert recordings to WAV format
      const wavPromises = graph.inputs.map(async input => {
        const webmBlob = recordings[input.name]
        const wavBlob = await convertToWav(webmBlob)
        return new File([wavBlob], `${input.name}.wav`, { type: 'audio/wav' })
      })

      const audioFiles = await Promise.all(wavPromises)
      const outputZip = await processAudio(audioFiles)
      
      // Extract files from zip using JSZip
      const zip = new JSZip()
      const zipContents = await zip.loadAsync(outputZip)
      
      // Process each file in the zip
      const outputs: Record<string, Blob> = {}
      const extractPromises = graph.outputs.map(async output => {
        const fileName = `${output.name}.wav`
        const file = zipContents.files[fileName]
        if (file) {
          const blob = await file.async('blob')
          outputs[output.name] = blob
        }
      })
      
      await Promise.all(extractPromises)
      setProcessedOutputs(outputs)
    } catch (error) {
      console.error('Error processing recordings:', error)
    }
  }, [hasAllRecordings, recordings, graph.inputs, graph.outputs])

  // Process recordings whenever we have all of them
  useEffect(() => {
    if (hasAllRecordings) {
      processRecordings()
    }
  }, [recordings, processRecordings])

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
    const audioElement = audioElements[inputName]
    if (!audioElement) return

    audioElement.play()
    setPlayingInputs(prev => ({ ...prev, [inputName]: true }))

    // When playback ends
    audioElement.onended = () => {
      setPlayingInputs(prev => ({ ...prev, [inputName]: false }))
    }
  }, [audioElements])

  const stopPlayback = useCallback((inputName: string) => {
    const audioElement = audioElements[inputName]
    if (audioElement) {
      audioElement.pause()
      audioElement.currentTime = 0
      setPlayingInputs(prev => ({ ...prev, [inputName]: false }))
    }
  }, [audioElements])

  const startOutputPlayback = useCallback((outputName: string) => {
    const audioElement = outputAudioElements[outputName]
    if (!audioElement) return

    audioElement.play()
    setPlayingOutputs(prev => ({ ...prev, [outputName]: true }))

    // When playback ends
    audioElement.onended = () => {
      setPlayingOutputs(prev => ({ ...prev, [outputName]: false }))
    }
  }, [outputAudioElements])

  const stopOutputPlayback = useCallback((outputName: string) => {
    const audioElement = outputAudioElements[outputName]
    if (audioElement) {
      audioElement.pause()
      audioElement.currentTime = 0
      setPlayingOutputs(prev => ({ ...prev, [outputName]: false }))
    }
  }, [outputAudioElements])

  return (
    <div
      className={`${commonStyles.container.primary} flex justify-between items-center border-t-0 border-x-0 py-2 ${theme.colors.border}`}
    >
      <div className="flex gap-2 items-center flex-1 min-w-0">
        {/* All controls in a single flex container */}
        <div className="flex gap-2 flex-1 min-w-0">
          {/* Input Controls */}
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

          {/* Output Controls - only show when all inputs have recordings */}
          {hasAllRecordings && graph.outputs.map((output, idx) => (
            <PlaybackControl 
              key={`output-${idx}`} 
              output={output}
              processedOutput={processedOutputs[output.name]}
              onPlay={() => startOutputPlayback(output.name)}
              onStop={() => stopOutputPlayback(output.name)}
              isPlaying={!!playingOutputs[output.name]}
            />
          ))}
        </div>
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