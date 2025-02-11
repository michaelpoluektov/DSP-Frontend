import type { BiquadFilterType, ParametricEqParameters } from '../types/graph';

interface FrequencyResponse {
	frequencies: number[];
	magnitudes: number[];
	phases: number[];
}

interface FilterSpec {
	type: string;
	freq?: number;
	q?: number;
	bandwidth?: number;
	gain?: number;
}

function biquadFilterToSpec(filter: BiquadFilterType): FilterSpec | FilterSpec[] {
	switch (filter.type) {
		case 'bypass':
			return { type: 'bypass' };
		case 'lowpass':
		case 'highpass':
		case 'notch':
		case 'allpass':
			return {
				type: filter.type,
				freq: filter.filter_freq,
				q: filter.q_factor
			};
		case 'bandpass':
		case 'bandstop':
			return {
				type: filter.type,
				freq: filter.filter_freq,
				bandwidth: filter.bw
			};
		case 'peaking':
		case 'lowshelf':
		case 'highshelf':
			return {
				type: filter.type,
				freq: filter.filter_freq,
				q: filter.q_factor,
				gain: filter.boost_db
			};
		case 'constant_q':
			return {
				type: 'peaking',
				freq: filter.filter_freq,
				q: filter.q_factor,
				gain: filter.boost_db
			};
		case 'gain':
			return {
				type: 'peaking',
				freq: 1000, // Center frequency doesn't matter for pure gain
				q: 0.707, // Neutral Q factor
				gain: filter.gain_db
			};
		case 'linkwitz':
			// For Linkwitz transform, we'll approximate it with two filters
			return [
				{
					type: 'peaking',
					freq: filter.f0,
					q: filter.q0,
					gain: 0 // The gain would need to be calculated based on f0/fp ratio
				},
				{
					type: 'peaking',
					freq: filter.fp,
					q: filter.qp,
					gain: 0 // The gain would need to be calculated based on f0/fp ratio
				}
			];
	}
}

export async function calculateEQResponse(
	parameters: ParametricEqParameters,
	sampleRate: number = 48000
): Promise<FrequencyResponse> {
	// We'll use the Web Audio API to calculate the frequency response
	const audioContext = new (window.AudioContext || (window as any).webkitAudioContext)();
	const nBins = 512;

	try {
		// Create frequency array (logarithmic scale from 20Hz to 20kHz)
		const frequencies = new Float32Array(nBins);
		for (let i = 0; i < nBins; i++) {
			frequencies[i] = 20 * Math.pow(1000, i / (nBins - 1));
		}

		// Initialize magnitude and phase arrays
		const magnitudes = new Float32Array(nBins);
		const phases = new Float32Array(nBins);

		// Process in chunks to avoid blocking the UI
		const chunkSize = 64;
		for (let chunk = 0; chunk < nBins; chunk += chunkSize) {
			await new Promise((resolve) => setTimeout(resolve, 0)); // Yield to main thread

			for (let i = chunk; i < Math.min(chunk + chunkSize, nBins); i++) {
				let hasActiveFilter = false;
				let totalMagnitude = 0;
				let totalPhase = 0;

				// Process each filter
				parameters.filters.forEach((filter) => {
					const specs = biquadFilterToSpec(filter);
					const filterSpecs = Array.isArray(specs) ? specs : [specs];

					filterSpecs.forEach((spec) => {
						if (spec.type === 'bypass') return;

						hasActiveFilter = true;
						// Create a biquad filter node
						const biquadFilter = audioContext.createBiquadFilter();
						biquadFilter.type = spec.type as BiquadFilterNode['type'];
						if (spec.freq) biquadFilter.frequency.value = spec.freq;
						if (spec.q) biquadFilter.Q.value = spec.q;
						if (spec.gain) biquadFilter.gain.value = spec.gain;

						// Get frequency response at this frequency
						const magResponse = new Float32Array(1);
						const phaseResponse = new Float32Array(1);
						biquadFilter.getFrequencyResponse(
							new Float32Array([frequencies[i]]),
							magResponse,
							phaseResponse
						);

						// Add to total response (in dB for magnitude, radians for phase)
						totalMagnitude += 20 * Math.log10(magResponse[0] || 1e-10); // Prevent log of 0
						totalPhase += phaseResponse[0];
					});
				});

				// If all filters are bypassed, set magnitude to 0 dB (unity gain)
				magnitudes[i] = hasActiveFilter ? totalMagnitude : 0;
				phases[i] = hasActiveFilter ? totalPhase : 0;
			}
		}

		return {
			frequencies: Array.from(frequencies),
			magnitudes: Array.from(magnitudes),
			phases: Array.from(phases)
		};
	} finally {
		audioContext.close();
	}
}
