import type { Graph } from '../types/graph';

const API_BASE_URL = 'http://localhost:8080';
const API_BASE_SUFFIX = 'api/v1/dsp';
const SESSION_ID = '42';

export async function fetchGraph(): Promise<Graph> {
	const response = await fetch(`${API_BASE_URL}/${API_BASE_SUFFIX}/graph?session_id=${SESSION_ID}`);
	if (!response.ok) {
		throw new Error('Failed to fetch graph');
	}
	return response.json();
}

export async function updateGraph(graph: Graph): Promise<Graph> {
	console.log('Updating graph', JSON.stringify(graph));
	const response = await fetch(
		`${API_BASE_URL}/${API_BASE_SUFFIX}/graph?session_id=${SESSION_ID}`,
		{
			method: 'POST',
			headers: {
				'Content-Type': 'application/json'
			},
			body: JSON.stringify(graph)
		}
	);
	if (!response.ok) {
		throw new Error('Failed to update graph');
	}
	return response.json();
}

export function subscribeToGraphUpdates(callback: (graph: Graph) => void) {
	const eventSource = new EventSource(
		`${API_BASE_URL}/${API_BASE_SUFFIX}/graph-updates?session_id=${SESSION_ID}`
	);
	eventSource.onmessage = (event) => {
		try {
			const updatedGraph = JSON.parse(event.data);
			callback(updatedGraph);
		} catch (e) {
			console.error('Failed to parse graph update', e);
			console.log(event.data);
			return;
		}
	};
	return () => eventSource.close();
}

export async function processAudio(audioFiles: File[]): Promise<Blob> {
	const formData = new FormData();
	audioFiles.forEach((file) => {
		formData.append('files', file);
	});

	const response = await fetch(
		`${API_BASE_URL}/${API_BASE_SUFFIX}/graph/audio?session_id=${SESSION_ID}`,
		{
			method: 'POST',
			body: formData
		}
	);

	if (!response.ok) {
		throw new Error('Failed to process audio files');
	}

	const outputZip = await response.blob();
	console.log('Received processed audio outputs');
	return outputZip;
}
