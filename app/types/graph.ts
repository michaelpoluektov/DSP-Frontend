// Basic types
type NodePlacement = {
  input: number[]
  output: number[]
  name: string
  thread: number
}

type CompressorPlacement = Omit<NodePlacement, "input" | "output"> & {
  input: [number, number]
  output: [number]
}

type ForkPlacement = Omit<NodePlacement, "input"> & {
  input: [number]
}

type MixerPlacement = Omit<NodePlacement, "output"> & {
  output: [number]
}

type EnvelopeDetectorPlacement = Omit<NodePlacement, "output"> & {
  output: never[]
}

// Parameter types
type CompressorSidechainParameters = {
  ratio: number
  threshold_db: number
  attack_t: number
  release_t: number
}

type FixedGainParameters = {
  gain_db: number
}

type ForkConfig = {
  count: number
}

type MixerParameters = {
  gain_db: number
}

type VolumeControlParameters = {
  gain_db: number
  mute_state: number
}

type SwitchParameters = {
  position: number
}

type BiquadFilterType =
  | { type: "allpass"; filter_freq: number; q_factor: number }
  | { type: "bandpass"; filter_freq: number; bw: number }
  | { type: "bandstop"; filter_freq: number; bw: number }
  | { type: "bypass" }
  | { type: "constant_q"; filter_freq: number; q_factor: number; boost_db: number }
  | { type: "gain"; gain_db: number }
  | { type: "highpass"; filter_freq: number; q_factor: number }
  | { type: "highshelf"; filter_freq: number; q_factor: number; boost_db: number }
  | { type: "linkwitz"; f0: number; q0: number; fp: number; qp: number }
  | { type: "lowpass"; filter_freq: number; q_factor: number }
  | { type: "lowshelf"; filter_freq: number; q_factor: number; boost_db: number }
  | { type: "notch"; filter_freq: number; q_factor: number }
  | { type: "peaking"; filter_freq: number; q_factor: number; boost_db: number }

type ParametricEqParameters = {
  filters: [
    BiquadFilterType,
    BiquadFilterType,
    BiquadFilterType,
    BiquadFilterType,
    BiquadFilterType,
    BiquadFilterType,
    BiquadFilterType,
    BiquadFilterType,
  ]
}

type ReverbBaseConfig = {
  predelay: number
}

type ReverbPlateParameters = {
  predelay: number
  width: number
  pregain: number
  wet_dry_mix: number
  damping: number
  decay: number
  early_diffusion: number
  late_diffusion: number
  bandwidth: number
}

// Node types
type Adder = {
  placement: NodePlacement
  op_type: "Adder"
}

type CompressorSidechain = {
  placement: CompressorPlacement
  op_type: "CompressorSidechain"
  parameters?: CompressorSidechainParameters
}

type EnvelopeDetectorPeak = {
  placement: EnvelopeDetectorPlacement
  op_type: "EnvelopeDetectorPeak"
  parameters?: {
    attack_t: number
    release_t: number
  }
}

type EnvelopeDetectorRMS = {
  placement: EnvelopeDetectorPlacement
  op_type: "EnvelopeDetectorRMS"
  parameters?: {
    attack_t: number
    release_t: number
  }
}

type FixedGain = {
  placement: NodePlacement
  op_type: "FixedGain"
  parameters?: FixedGainParameters
}

type Fork = {
  placement: ForkPlacement
  op_type: "Fork"
  config?: ForkConfig
}

type Mixer = {
  placement: MixerPlacement
  op_type: "Mixer"
  parameters?: MixerParameters
}

type NoiseSuppressorExpander = {
  placement: NodePlacement
  op_type: "NoiseSuppressorExpander"
  parameters?: CompressorSidechainParameters
}

type ParametricEq = {
  placement: NodePlacement
  op_type: "ParametricEq"
  parameters?: ParametricEqParameters
}

type ReverbPlateStereo = {
  placement: NodePlacement
  op_type: "ReverbPlateStereo"
  config?: ReverbBaseConfig
  parameters?: ReverbPlateParameters
}

type Switch = {
  placement: NodePlacement
  op_type: "Switch"
  parameters?: SwitchParameters
}

type SwitchStereo = {
  placement: NodePlacement
  op_type: "SwitchStereo"
  parameters?: SwitchParameters
}

type VolumeControl = {
  placement: NodePlacement
  op_type: "VolumeControl"
  parameters?: VolumeControlParameters
}

export type Node =
  | Adder
  | CompressorSidechain
  | EnvelopeDetectorPeak
  | EnvelopeDetectorRMS
  | FixedGain
  | Fork
  | Mixer
  | NoiseSuppressorExpander
  | ParametricEq
  | ReverbPlateStereo
  | Switch
  | SwitchStereo
  | VolumeControl

type Input = {
  name: string
  output: number[]
  channels: number
  fs: number
}

type Output = {
  name: string
  input: number[]
  channels: number
  fs?: number | null
}

export type Graph = {
  name: string
  nodes: Node[]
  input: Input
  output: Output
}

export const initialGraph: Graph = {
  name: "Stereo Compressor with Volume Control",
  nodes: [
    {
      op_type: "Fork",
      config: {
        count: 1,
      },
      placement: {
        input: [0],
        output: [10, 11],
        name: "LeftFork",
        thread: 0,
      },
    },
    {
      op_type: "Fork",
      config: {
        count: 1,
      },
      placement: {
        input: [1],
        output: [12, 13],
        name: "RightFork",
        thread: 0,
      },
    },
    {
      op_type: "Mixer",
      parameters: {
        gain_db: 0,
      },
      placement: {
        input: [11, 13],
        output: [14],
        name: "DetectionMixer",
        thread: 0,
      },
    },
    {
      op_type: "Fork",
      config: {
        count: 1,
      },
      placement: {
        input: [14],
        output: [15, 16],
        name: "DetectionFork",
        thread: 0,
      },
    },
    {
      op_type: "CompressorSidechain",
      parameters: {
        ratio: 3,
        threshold_db: -35,
        attack_t: 0.005,
        release_t: 0.12,
      },
      placement: {
        input: [10, 15],
        output: [17],
        name: "LeftCompressor",
        thread: 1,
      },
    },
    {
      op_type: "CompressorSidechain",
      parameters: {
        ratio: 3,
        threshold_db: -35,
        attack_t: 0.005,
        release_t: 0.12,
      },
      placement: {
        input: [12, 16],
        output: [18],
        name: "RightCompressor",
        thread: 2,
      },
    },
    {
      op_type: "VolumeControl",
      parameters: {
        gain_db: 0,
        mute_state: 0,
      },
      placement: {
        input: [17, 18],
        output: [19, 20],
        name: "StereoVolume",
        thread: 3,
      },
    },
  ],
  input: {
    name: "audio_in",
    output: [0, 1],
    channels: 2,
    fs: 48000,
  },
  output: {
    name: "audio_out",
    input: [19, 20],
    channels: 2,
  },
}

