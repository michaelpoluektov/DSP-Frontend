import { z } from 'zod'

export type ParameterConfig = {
  type: 'slider' | 'integer' | 'boolean'
  min?: number
  max?: number
  step?: number
  default?: number | boolean
  useLogScale?: boolean
  title?: string
  description?: string
}

// Helper to create parameter configs
const createParamConfig = (config: ParameterConfig): ParameterConfig => config

// Define parameter configurations
export const parameterConfigs: Record<string, Record<string, ParameterConfig>> = {
  Mixer: {
    gain_db: createParamConfig({
      type: 'slider',
      min: -60,
      max: 12,
      step: 0.1,
      default: 0,
      title: 'Gain',
      description: 'Gain in dB'
    })
  },
  FixedGain: {
    gain_db: createParamConfig({
      type: 'slider',
      min: -60,
      max: 12,
      step: 0.1,
      default: 0,
      title: 'Gain',
      description: 'Gain in dB'
    })
  },
  VolumeControl: {
    gain_db: createParamConfig({
      type: 'slider',
      min: -60,
      max: 12,
      step: 0.1,
      default: 0,
      title: 'Gain',
      description: 'Gain in dB'
    }),
    mute_state: createParamConfig({
      type: 'boolean',
      default: false,
      title: 'Mute',
      description: 'Mute state'
    })
  },
  Switch: {
    position: createParamConfig({
      type: 'integer',
      min: 0,
      max: 8,
      default: 0,
      title: 'Position',
      description: 'Switch position'
    })
  },
  SwitchStereo: {
    position: createParamConfig({
      type: 'integer',
      min: 0,
      max: 8,
      default: 0,
      title: 'Position',
      description: 'Switch position'
    })
  },
  CompressorSidechain: {
    ratio: createParamConfig({
      type: 'slider',
      min: 1,
      max: 20,
      step: 0.1,
      default: 3,
      useLogScale: true,
      title: 'Ratio',
      description: 'Compression ratio'
    }),
    threshold_db: createParamConfig({
      type: 'slider',
      min: -60,
      max: 0,
      step: 0.1,
      default: -35,
      title: 'Threshold',
      description: 'Threshold in dB'
    }),
    attack_t: createParamConfig({
      type: 'slider',
      min: 0.001,
      max: 1,
      step: 0.001,
      default: 0.005,
      useLogScale: true,
      title: 'Attack',
      description: 'Attack time in seconds'
    }),
    release_t: createParamConfig({
      type: 'slider',
      min: 0.01,
      max: 2,
      step: 0.01,
      default: 0.12,
      useLogScale: true,
      title: 'Release',
      description: 'Release time in seconds'
    })
  },
  NoiseSuppressorExpander: {
    ratio: createParamConfig({
      type: 'slider',
      min: 1,
      max: 20,
      step: 0.1,
      default: 3,
      useLogScale: true,
      title: 'Ratio',
      description: 'Expansion ratio'
    }),
    threshold_db: createParamConfig({
      type: 'slider',
      min: -60,
      max: 0,
      step: 0.1,
      default: -35,
      title: 'Threshold',
      description: 'Threshold in dB'
    }),
    attack_t: createParamConfig({
      type: 'slider',
      min: 0.001,
      max: 1,
      step: 0.001,
      default: 0.005,
      useLogScale: true,
      title: 'Attack',
      description: 'Attack time in seconds'
    }),
    release_t: createParamConfig({
      type: 'slider',
      min: 0.01,
      max: 2,
      step: 0.01,
      default: 0.12,
      useLogScale: true,
      title: 'Release',
      description: 'Release time in seconds'
    })
  },
  EnvelopeDetectorPeak: {
    attack_t: createParamConfig({
      type: 'slider',
      min: 0.001,
      max: 1,
      step: 0.001,
      default: 0.005,
      useLogScale: true,
      title: 'Attack',
      description: 'Attack time in seconds'
    }),
    release_t: createParamConfig({
      type: 'slider',
      min: 0.01,
      max: 2,
      step: 0.01,
      default: 0.12,
      useLogScale: true,
      title: 'Release',
      description: 'Release time in seconds'
    })
  },
  EnvelopeDetectorRMS: {
    attack_t: createParamConfig({
      type: 'slider',
      min: 0.001,
      max: 1,
      step: 0.001,
      default: 0.005,
      useLogScale: true,
      title: 'Attack',
      description: 'Attack time in seconds'
    }),
    release_t: createParamConfig({
      type: 'slider',
      min: 0.01,
      max: 2,
      step: 0.01,
      default: 0.12,
      useLogScale: true,
      title: 'Release',
      description: 'Release time in seconds'
    })
  },
  ReverbPlateStereo: {
    predelay: createParamConfig({
      type: 'slider',
      min: 0,
      max: 30,
      step: 0.1,
      default: 15,
      title: 'Predelay',
      description: 'Predelay in milliseconds'
    }),
    width: createParamConfig({
      type: 'slider',
      min: 0,
      max: 1,
      step: 0.01,
      default: 1.0,
      title: 'Width',
      description: 'Stereo width'
    }),
    pregain: createParamConfig({
      type: 'slider',
      min: 0,
      max: 1,
      step: 0.01,
      default: 0.5,
      title: 'Pregain',
      description: 'Input gain'
    }),
    wet_dry_mix: createParamConfig({
      type: 'slider',
      min: 0,
      max: 1,
      step: 0.01,
      default: 0.5,
      title: 'Mix',
      description: 'Wet/dry mix'
    }),
    damping: createParamConfig({
      type: 'slider',
      min: 0,
      max: 1,
      step: 0.01,
      default: 0.5,
      title: 'Damping',
      description: 'High frequency damping'
    }),
    decay: createParamConfig({
      type: 'slider',
      min: 0,
      max: 1,
      step: 0.01,
      default: 0.5,
      title: 'Decay',
      description: 'Reverb decay time'
    }),
    early_diffusion: createParamConfig({
      type: 'slider',
      min: 0,
      max: 1,
      step: 0.01,
      default: 0.2,
      title: 'Early Diffusion',
      description: 'Early reflections diffusion'
    }),
    late_diffusion: createParamConfig({
      type: 'slider',
      min: 0,
      max: 1,
      step: 0.01,
      default: 0.6,
      title: 'Late Diffusion',
      description: 'Late reflections diffusion'
    }),
    bandwidth: createParamConfig({
      type: 'slider',
      min: 20,
      max: 24000,
      step: 1,
      default: 8000,
      useLogScale: true,
      title: 'Bandwidth',
      description: 'Bandwidth in Hz'
    })
  }
} 