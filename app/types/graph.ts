// Basic types
type NodePlacement = {
	input: number[];
	output: number[];
	name: string;
	thread: number;
};

type CompressorPlacement = Omit<NodePlacement, 'input' | 'output'> & {
	input: [number, number];
	output: [number];
};

type MixerPlacement = Omit<NodePlacement, 'output'> & {
	output: [number];
};

type EnvelopeDetectorPlacement = Omit<NodePlacement, 'output'> & {
	output: never[];
};

// Parameter types
type CompressorSidechainParameters = {
	ratio: number;
	threshold_db: number;
	attack_t: number;
	release_t: number;
};

type FixedGainParameters = {
	gain_db: number;
};

type MixerParameters = {
	gain_db: number;
};

type VolumeControlParameters = {
	gain_db: number;
	mute_state: number;
};

type SwitchParameters = {
	position: number;
};

export type BiquadFilterType =
	| { type: 'allpass'; filter_freq: number; q_factor: number }
	| { type: 'bandpass'; filter_freq: number; bw: number }
	| { type: 'bandstop'; filter_freq: number; bw: number }
	| { type: 'bypass' }
	| { type: 'constant_q'; filter_freq: number; q_factor: number; boost_db: number }
	| { type: 'gain'; gain_db: number }
	| { type: 'highpass'; filter_freq: number; q_factor: number }
	| { type: 'highshelf'; filter_freq: number; q_factor: number; boost_db: number }
	| { type: 'linkwitz'; f0: number; q0: number; fp: number; qp: number }
	| { type: 'lowpass'; filter_freq: number; q_factor: number }
	| { type: 'lowshelf'; filter_freq: number; q_factor: number; boost_db: number }
	| { type: 'notch'; filter_freq: number; q_factor: number }
	| { type: 'peaking'; filter_freq: number; q_factor: number; boost_db: number };

export type ParametricEqParameters = {
	filters: [
		BiquadFilterType,
		BiquadFilterType,
		BiquadFilterType,
		BiquadFilterType,
		BiquadFilterType,
		BiquadFilterType,
		BiquadFilterType,
		BiquadFilterType
	];
};

type ReverbBaseConfig = {
	predelay: number;
};

type ReverbPlateParameters = {
	predelay: number;
	width: number;
	pregain: number;
	wet_dry_mix: number;
	damping: number;
	decay: number;
	early_diffusion: number;
	late_diffusion: number;
	bandwidth: number;
};

// Node types
type Adder = {
	placement: NodePlacement;
	op_type: 'Adder';
};

type CompressorSidechain = {
	placement: CompressorPlacement;
	op_type: 'CompressorSidechain';
	parameters?: CompressorSidechainParameters;
};

type EnvelopeDetectorPeak = {
	placement: EnvelopeDetectorPlacement;
	op_type: 'EnvelopeDetectorPeak';
	parameters?: {
		attack_t: number;
		release_t: number;
	};
};

type EnvelopeDetectorRMS = {
	placement: EnvelopeDetectorPlacement;
	op_type: 'EnvelopeDetectorRMS';
	parameters?: {
		attack_t: number;
		release_t: number;
	};
};

type FixedGain = {
	placement: NodePlacement;
	op_type: 'FixedGain';
	parameters?: FixedGainParameters;
};

type Mixer = {
	placement: MixerPlacement;
	op_type: 'Mixer';
	parameters?: MixerParameters;
};

type NoiseSuppressorExpander = {
	placement: NodePlacement;
	op_type: 'NoiseSuppressorExpander';
	parameters?: CompressorSidechainParameters;
};

export type ParametricEq = {
	placement: NodePlacement;
	op_type: 'ParametricEq';
	parameters?: ParametricEqParameters;
};

type ReverbPlateStereo = {
	placement: NodePlacement;
	op_type: 'ReverbPlateStereo';
	config?: ReverbBaseConfig;
	parameters?: ReverbPlateParameters;
};

type Switch = {
	placement: NodePlacement;
	op_type: 'Switch';
	parameters?: SwitchParameters;
};

type SwitchStereo = {
	placement: NodePlacement;
	op_type: 'SwitchStereo';
	parameters?: SwitchParameters;
};

type VolumeControl = {
	placement: NodePlacement;
	op_type: 'VolumeControl';
	parameters?: VolumeControlParameters;
};

// Add missing types
type BiquadParameters = {
	filter_type: BiquadFilterType;
	slew_rate?: number; // default: 1.0, min: >=0.1, max 100, use log scale
};

type Biquad = {
	placement: NodePlacement;
	op_type: 'Biquad';
	parameters?: BiquadParameters;
};

type CompressorParameters = {
	ratio: number; // default: 4.0, min: >1.0, max: 20.0
	threshold_db: number; // default: 0.0, min: -96.0, max: 0.0
	attack_t: number; // default: 0.01, min: >0.0, max: 1.0
	release_t: number; // default: 0.2, min: >0.0, max: 5.0
};

type CompressorRMS = {
	placement: NodePlacement;
	op_type: 'CompressorRMS';
	parameters?: CompressorParameters;
};

type DelayConfig = {
	max_delay: number; // default: 1024, min: >0
};

type DelayParameters = {
	delay: number; // default: 0, min: 0
	units: 'samples' | 'seconds'; // default: 'samples'
};

type Delay = {
	placement: NodePlacement;
	op_type: 'Delay';
	parameters?: DelayParameters;
	config?: DelayConfig;
};

type LimiterParameters = {
	threshold_db: number; // default: 0.0, min: -96.0, max: 0.0
	attack_t: number; // default: 0.01, min: >0.0, max: 1.0
	release_t: number; // default: 0.2, min: >0.0, max: 5.0
};

type LimiterRMS = {
	placement: NodePlacement;
	op_type: 'LimiterRMS';
	parameters?: LimiterParameters;
};

type LimiterPeak = {
	placement: NodePlacement;
	op_type: 'LimiterPeak';
	parameters?: LimiterParameters;
};

type HardLimiterPeak = {
	placement: NodePlacement;
	op_type: 'HardLimiterPeak';
	parameters?: LimiterParameters;
};

type NoiseGateParameters = {
	threshold_db: number; // default: -40.0, min: -96.0, max: 0.0
	attack_t: number; // default: 0.01, min: >0.0, max: 1.0
	release_t: number; // default: 0.1, min: >0.0, max: 5.0
};

type NoiseGate = {
	placement: NodePlacement;
	op_type: 'NoiseGate';
	parameters?: NoiseGateParameters;
};

// Update Node type to include new nodes
export type Node =
	| Adder
	| Biquad
	| CompressorRMS
	| CompressorSidechain
	| Delay
	| EnvelopeDetectorPeak
	| EnvelopeDetectorRMS
	| FixedGain
	| HardLimiterPeak
	| LimiterPeak
	| LimiterRMS
	| Mixer
	| NoiseGate
	| NoiseSuppressorExpander
	| ParametricEq
	| ReverbPlateStereo
	| Switch
	| SwitchStereo
	| VolumeControl;

export type Input = {
	name: string;
	output: [number] | [number, number];
};

export type Output = {
	name: string;
	input: [number] | [number, number];
};

export type Graph = {
	name: string;
	fs: number;
	nodes: Node[];
	inputs: Input[];
	outputs: Output[];
};

export const initialGraph: Graph = {
	name: 'Stereo Compressor with Volume Control',
	fs: 48000,
	nodes: [
		{
			op_type: 'Mixer',
			parameters: {
				gain_db: 0
			},
			placement: {
				input: [0, 1],
				output: [2],
				name: 'DetectionMixer',
				thread: 0
			}
		},
		{
			op_type: 'CompressorSidechain',
			parameters: {
				ratio: 3,
				threshold_db: -35,
				attack_t: 0.005,
				release_t: 0.12
			},
			placement: {
				input: [0, 2],
				output: [3],
				name: 'LeftCompressor',
				thread: 1
			}
		},
		{
			op_type: 'CompressorSidechain',
			parameters: {
				ratio: 3,
				threshold_db: -35,
				attack_t: 0.005,
				release_t: 0.12
			},
			placement: {
				input: [1, 2],
				output: [4],
				name: 'RightCompressor',
				thread: 2
			}
		},
		{
			op_type: 'VolumeControl',
			parameters: {
				gain_db: 0,
				mute_state: 0
			},
			placement: {
				input: [3, 4],
				output: [5, 6],
				name: 'StereoVolume',
				thread: 3
			}
		},
		{
			op_type: 'ParametricEq',
			parameters: {
				filters: [
					{ type: 'bypass' },
					{ type: 'bypass' },
					{ type: 'bypass' },
					{ type: 'bypass' },
					{ type: 'bypass' },
					{ type: 'bypass' },
					{ type: 'bypass' },
					{ type: 'bypass' }
				]
			},
			placement: {
				input: [5, 6],
				output: [7, 8],
				name: 'StereoEQ',
				thread: 4
			}
		}
	],
	inputs: [
		{
			name: 'audio_in',
			output: [0, 1]
		}
	],
	outputs: [
		{
			name: 'audio_out',
			input: [7, 8]
		}
	]
};
