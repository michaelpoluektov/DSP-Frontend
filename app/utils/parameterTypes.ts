import { z } from 'zod';

export type ParameterConfig = {
	type: 'slider' | 'integer' | 'boolean';
	min?: number;
	max?: number;
	step?: number;
	default?: number | boolean;
	useLogScale?: boolean;
	title?: string;
	description?: string;
};

// Helper to create parameter configs
const createParamConfig = (config: ParameterConfig): ParameterConfig => config;

// Factory functions for common parameter types
const createGainParameter = (overrides?: Partial<ParameterConfig>): ParameterConfig => ({
	type: 'slider',
	min: -60,
	max: 12,
	step: 0.1,
	default: 0,
	title: 'Gain',
	description: 'Gain in dB',
	...overrides
});

const createTimeParameter = (
	defaults: { min: number; max: number; default: number },
	overrides?: Partial<ParameterConfig>
): ParameterConfig => ({
	type: 'slider',
	min: defaults.min,
	max: defaults.max,
	step: defaults.min, // Step is same as min for time parameters
	default: defaults.default,
	useLogScale: true,
	...overrides
});

// Add frequency parameter helper
const createFrequencyParameter = (
	defaults: { min: number; max: number; default: number },
	overrides?: Partial<ParameterConfig>
): ParameterConfig => ({
	type: 'slider',
	min: defaults.min,
	max: defaults.max,
	step: 1,
	default: defaults.default,
	useLogScale: true,
	...overrides
});

// Define parameter configurations
export const parameterConfigs: Record<string, Record<string, ParameterConfig>> = {
	Mixer: {
		gain_db: createGainParameter()
	},
	FixedGain: {
		gain_db: createGainParameter()
	},
	VolumeControl: {
		gain_db: createGainParameter(),
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
		attack_t: createTimeParameter(
			{ min: 0.001, max: 1, default: 0.005 },
			{ title: 'Attack', description: 'Attack time in seconds' }
		),
		release_t: createTimeParameter(
			{ min: 0.01, max: 2, default: 0.12 },
			{ title: 'Release', description: 'Release time in seconds' }
		)
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
		attack_t: createTimeParameter(
			{ min: 0.001, max: 1, default: 0.005 },
			{ title: 'Attack', description: 'Attack time in seconds' }
		),
		release_t: createTimeParameter(
			{ min: 0.01, max: 2, default: 0.12 },
			{ title: 'Release', description: 'Release time in seconds' }
		)
	},
	EnvelopeDetectorPeak: {
		attack_t: createTimeParameter(
			{ min: 0.001, max: 1, default: 0.005 },
			{ title: 'Attack', description: 'Attack time in seconds' }
		),
		release_t: createTimeParameter(
			{ min: 0.01, max: 2, default: 0.12 },
			{ title: 'Release', description: 'Release time in seconds' }
		)
	},
	EnvelopeDetectorRMS: {
		attack_t: createTimeParameter(
			{ min: 0.001, max: 1, default: 0.005 },
			{ title: 'Attack', description: 'Attack time in seconds' }
		),
		release_t: createTimeParameter(
			{ min: 0.01, max: 2, default: 0.12 },
			{ title: 'Release', description: 'Release time in seconds' }
		)
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
	},
	CompressorRMS: {
		ratio: createParamConfig({
			type: 'slider',
			min: 1,
			max: 20,
			step: 0.1,
			default: 4,
			useLogScale: true,
			title: 'Ratio',
			description: 'Compression ratio'
		}),
		threshold_db: createParamConfig({
			type: 'slider',
			min: -96,
			max: 0,
			step: 0.1,
			default: 0,
			title: 'Threshold',
			description: 'Threshold in dB'
		}),
		attack_t: createTimeParameter(
			{ min: 0.001, max: 1, default: 0.01 },
			{ title: 'Attack', description: 'Attack time in seconds' }
		),
		release_t: createTimeParameter(
			{ min: 0.01, max: 5, default: 0.2 },
			{ title: 'Release', description: 'Release time in seconds' }
		)
	},
	Delay: {
		delay: createParamConfig({
			type: 'slider',
			min: 0,
			max: 1024,
			step: 1,
			default: 0,
			title: 'Delay',
			description: 'Delay length in samples'
		})
	},
	LimiterRMS: {
		threshold_db: createParamConfig({
			type: 'slider',
			min: -96,
			max: 0,
			step: 0.1,
			default: 0,
			title: 'Threshold',
			description: 'Threshold in dB'
		}),
		attack_t: createTimeParameter(
			{ min: 0.001, max: 1, default: 0.01 },
			{ title: 'Attack', description: 'Attack time in seconds' }
		),
		release_t: createTimeParameter(
			{ min: 0.01, max: 5, default: 0.2 },
			{ title: 'Release', description: 'Release time in seconds' }
		)
	},
	LimiterPeak: {
		threshold_db: createParamConfig({
			type: 'slider',
			min: -96,
			max: 0,
			step: 0.1,
			default: 0,
			title: 'Threshold',
			description: 'Threshold in dB'
		}),
		attack_t: createTimeParameter(
			{ min: 0.001, max: 1, default: 0.01 },
			{ title: 'Attack', description: 'Attack time in seconds' }
		),
		release_t: createTimeParameter(
			{ min: 0.01, max: 5, default: 0.2 },
			{ title: 'Release', description: 'Release time in seconds' }
		)
	},
	HardLimiterPeak: {
		threshold_db: createParamConfig({
			type: 'slider',
			min: -96,
			max: 0,
			step: 0.1,
			default: 0,
			title: 'Threshold',
			description: 'Threshold in dB'
		}),
		attack_t: createTimeParameter(
			{ min: 0.001, max: 1, default: 0.01 },
			{ title: 'Attack', description: 'Attack time in seconds' }
		),
		release_t: createTimeParameter(
			{ min: 0.01, max: 5, default: 0.2 },
			{ title: 'Release', description: 'Release time in seconds' }
		)
	},
	NoiseGate: {
		threshold_db: createParamConfig({
			type: 'slider',
			min: -96,
			max: 0,
			step: 0.1,
			default: -40,
			title: 'Threshold',
			description: 'Threshold in dB'
		}),
		attack_t: createTimeParameter(
			{ min: 0.001, max: 1, default: 0.01 },
			{ title: 'Attack', description: 'Attack time in seconds' }
		),
		release_t: createTimeParameter(
			{ min: 0.01, max: 5, default: 0.1 },
			{ title: 'Release', description: 'Release time in seconds' }
		)
	}
};
