declare module 'dagre' {
	const dagre: {
		graphlib: {
			Graph: new () => Graph;
		};
		layout: (graph: Graph) => void;
	};

	interface Graph {
		setGraph: (options: {
			rankdir?: string;
			nodesep?: number;
			ranksep?: number;
			edgesep?: number;
		}) => void;
		setDefaultEdgeLabel: (callback: () => object) => void;
		setNode: (id: string, options: { width: number; height: number }) => void;
		setEdge: (source: string, target: string) => void;
		node: (id: string) => { x: number; y: number };
	}

	export default dagre;
}
