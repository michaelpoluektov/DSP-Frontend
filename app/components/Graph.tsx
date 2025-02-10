import { useCallback, useMemo, memo, useEffect, useRef } from "react";
import ReactFlow, {
  Background,
  Controls,
  Edge,
  Handle,
  MiniMap,
  Node as FlowNode,
  NodeProps,
  Position,
  useReactFlow,
  Panel,
} from "reactflow";
import "reactflow/dist/style.css";
import dagre from "dagre";
import { theme } from "../styles/theme";
import type { Graph as GraphType, Node as DSPNode } from "../types/graph";

// Helper function to interpolate between two colors.
const interpolateColor = (thread: number, maxThread: number = 5) => {
  if (thread === undefined) return "white";

  const startColor = { r: 0x00, g: 0xb6, b: 0xb0 }; // #00B6B0
  const endColor = { r: 0xe5, g: 0xf7, b: 0xf6 }; // #E5F7F6
  const fraction = thread / maxThread;
  const whiteAmount = 0.8;
  const r = Math.round(
    (startColor.r + (endColor.r - startColor.r) * fraction) * (1 - whiteAmount) +
      255 * whiteAmount
  );
  const g = Math.round(
    (startColor.g + (endColor.g - startColor.g) * fraction) * (1 - whiteAmount) +
      255 * whiteAmount
  );
  const b = Math.round(
    (startColor.b + (endColor.b - startColor.b) * fraction) * (1 - whiteAmount) +
      255 * whiteAmount
  );
  return `rgb(${r}, ${g}, ${b})`;
};

// Custom node component.
const BaseNode = ({ data }: NodeProps) => {
  const bgColor = interpolateColor(data.thread);
  return (
    <div
      className={`shadow-lg rounded-lg border relative ${theme.colors.border}`}
      style={{
        width: "140px",
      }}
    >
      {/* Input handles */}
      {data.inputs.map((_: number, index: number) => (
        <Handle
          key={`input-${index}`}
          type="target"
          position={Position.Top}
          id={`input-${index}`}
          className="w-1.5 h-1.5"
          style={{
            left: `calc(50% + ${(index - (data.inputs.length - 1) / 2) * 16}px)`,
          }}
        />
      ))}

      {/* Title/Header */}
      <div
        style={{
          backgroundColor: bgColor,
          borderBottom: `1px solid ${theme.colors.border.split(" ")[1]}`,
          padding: "2px",
          borderTopLeftRadius: "inherit",
          borderTopRightRadius: "inherit",
        }}
      >
        <span className="font-medium text-sm block text-center">
          {data.name}
        </span>
      </div>

      {/* Footer */}
      <div
        style={{
          backgroundColor: "#fff",
          padding: "2px",
          position: "relative",
          borderBottomLeftRadius: "inherit",
          borderBottomRightRadius: "inherit",
        }}
      >
        <span className="text-xs block text-center">{data.op_type}</span>
        {data.thread !== undefined && (
          <div
            style={{
              position: "absolute",
              right: "0",
              bottom: "0",
              padding: "1px 4px",
              backgroundColor: "#eee",
              borderTopLeftRadius: "4px",
              fontSize: "10px",
            }}
          >
            {data.thread}
          </div>
        )}
      </div>

      {/* Output handles */}
      {data.outputs.map((_: number, index: number) => (
        <Handle
          key={`output-${index}`}
          type="source"
          position={Position.Bottom}
          id={`output-${index}`}
          className="w-1.5 h-1.5"
          style={{
            left: `calc(50% + ${(index - (data.outputs.length - 1) / 2) * 16}px)`,
          }}
        />
      ))}
    </div>
  );
};

// Define nodeTypes outside the component to keep the reference stable.
const nodeTypes = {
  dspNode: BaseNode,
};

// Helper function that uses Dagre to automatically layout nodes.
const getLayoutedElements = (
  nodes: FlowNode[],
  edges: Edge[],
  direction: "TB" | "LR" = "TB"
) => {
  const dagreGraph = new dagre.graphlib.Graph();
  dagreGraph.setDefaultEdgeLabel(() => ({}));
  dagreGraph.setGraph({
    rankdir: direction,
    nodesep: 50,
    ranksep: 35,
    edgesep: 10,
  });

  // These dimensions should match your node size.
  const nodeWidth = 140;
  const nodeHeight = 64;

  nodes.forEach((node) => {
    dagreGraph.setNode(node.id, { width: nodeWidth, height: nodeHeight });
  });
  edges.forEach((edge) => {
    dagreGraph.setEdge(edge.source, edge.target);
  });

  dagre.layout(dagreGraph);

  const layoutedNodes = nodes.map((node) => {
    const nodeWithPosition = dagreGraph.node(node.id);
    return {
      ...node,
      // Center the node by subtracting half the width/height.
      position: {
        x: nodeWithPosition.x - nodeWidth / 2,
        y: nodeWithPosition.y - nodeHeight / 2,
      },
      targetPosition: direction === "LR" ? Position.Left : Position.Top,
      sourcePosition: direction === "LR" ? Position.Right : Position.Bottom,
    };
  });

  return { nodes: layoutedNodes, edges };
};

export default memo(
  function Graph({
    graph,
    onNodeSelect,
    onParametricEqOpen,
  }: {
    graph: GraphType;
    onNodeSelect?: (nodeName: string) => void;
    onParametricEqOpen?: () => void;
  }) {
    const { fitView } = useReactFlow();
    const containerRef = useRef<HTMLDivElement>(null);

    // Memoize inline objects to ensure stable references.
    const defaultEdgeOptions = useMemo(
      () => ({
        type: "step",
        style: { strokeWidth: 1.5 },
      }),
      []
    );

    const proOptions = useMemo(() => ({ hideAttribution: true }), []);

    const defaultViewport = useMemo(() => ({ x: 0, y: 0, zoom: 0.5 }), []);

    // Node click handler.
    const handleNodeClick = useCallback(
      (event: React.MouseEvent, node: FlowNode) => {
        if (onNodeSelect && node.id !== "input" && node.id !== "output") {
          onNodeSelect(node.id);
          const dspNode = graph.nodes.find(
            (n) => n.placement.name === node.id
          );
          if (dspNode?.op_type === "ParametricEq" && onParametricEqOpen) {
            onParametricEqOpen();
          }
        }
      },
      [onNodeSelect, onParametricEqOpen, graph.nodes]
    );

    // Create nodes.
    const rawNodes: FlowNode[] = useMemo(() => {
      return [
        // Input nodes.
        ...graph.inputs.map((input) => ({
          id: `input-${input.name}`,
          type: "dspNode",
          position: { x: 0, y: 0 },
          data: {
            name: input.name,
            op_type: "Input",
            inputs: [],
            outputs: input.output,
          },
        })),
        // DSP nodes.
        ...graph.nodes.map((node: DSPNode) => ({
          id: node.placement.name,
          type: "dspNode",
          position: { x: 0, y: 0 },
          data: {
            name: node.placement.name,
            op_type: node.op_type,
            parameters: "parameters" in node ? node.parameters : undefined,
            config: "config" in node ? node.config : undefined,
            inputs: node.placement.input,
            outputs: node.placement.output,
            thread: node.placement.thread,
          },
        })),
        // Output nodes.
        ...graph.outputs.map((output) => ({
          id: `output-${output.name}`,
          type: "dspNode",
          position: { x: 0, y: 0 },
          data: {
            name: output.name,
            op_type: "Output",
            inputs: output.input,
            outputs: [],
          },
        })),
      ];
    }, [graph]);

    // Create edges.
    const rawEdges: Edge[] = useMemo(() => {
      const allEdges: Edge[] = [];

      const createEdges = (
        sourceId: string,
        sourceOutputs: number[],
        targetId: string,
        targetInputs: number[]
      ) => {
        return sourceOutputs.reduce((acc: Edge[], outputNum, idx) => {
          const matchingInputIdx = targetInputs.findIndex(
            (inputNum) => inputNum === outputNum
          );
          if (matchingInputIdx !== -1) {
            acc.push({
              id: `${sourceId}-${outputNum}-${targetId}-${matchingInputIdx}`,
              source: sourceId,
              target: targetId,
              sourceHandle: `output-${idx}`,
              targetHandle: `input-${matchingInputIdx}`,
              style: { strokeWidth: 1.5 },
              animated: false,
            });
          }
          return acc;
        }, []);
      };

      // Connect inputs to DSP nodes.
      graph.inputs.forEach((input) => {
        graph.nodes.forEach((node) => {
          allEdges.push(
            ...createEdges(
              `input-${input.name}`,
              input.output,
              node.placement.name,
              node.placement.input
            )
          );
        });
      });

      // Connect DSP nodes to each other.
      graph.nodes.forEach((sourceNode) => {
        graph.nodes.forEach((targetNode) => {
          if (sourceNode.placement.name !== targetNode.placement.name) {
            allEdges.push(
              ...createEdges(
                sourceNode.placement.name,
                sourceNode.placement.output,
                targetNode.placement.name,
                targetNode.placement.input
              )
            );
          }
        });
      });

      // Connect DSP nodes to outputs.
      graph.nodes.forEach((node) => {
        graph.outputs.forEach((output) => {
          allEdges.push(
            ...createEdges(
              node.placement.name,
              node.placement.output,
              `output-${output.name}`,
              output.input
            )
          );
        });
      });

      return allEdges;
    }, [graph]);

    // Apply Dagre layout.
    const { nodes, edges } = useMemo(() => {
      return getLayoutedElements(rawNodes, rawEdges, "TB");
    }, [rawNodes, rawEdges]);

    // Fit view on container resize or graph changes.
    useEffect(() => {
      const container = containerRef.current;
      if (!container) return;

      const resizeObserver = new ResizeObserver(() => {
        fitView({ padding: 0.2, duration: 200 });
      });

      resizeObserver.observe(container);

      const timeoutId = setTimeout(() => {
        fitView({ padding: 0.2, duration: 200 });
      }, 50);

      return () => {
        resizeObserver.disconnect();
        clearTimeout(timeoutId);
      };
    }, [fitView, nodes, edges]);

    return (
      <div
        ref={containerRef}
        className={`flex-1 ${theme.colors.primary} ${theme.spacing.md} overflow-hidden relative`}
      >
        <h2
          className={`${theme.fonts.subtitle} ${theme.colors.text.primary} ${theme.emphasis.background} ${theme.emphasis.padding} ${theme.rounded} ${theme.textEffect.shadow} mb-4 z-10 relative flex items-center justify-between border ${theme.colors.border}`}
        >
          {graph.name}
          <span
            className={`text-xs px-2 py-0.5 ${theme.colors.primary} ${theme.rounded} border ${theme.colors.border}`}
          >
            Fs: {graph.fs}Hz, {graph.nodes.length} nodes
          </span>
        </h2>
        <div className="absolute inset-0 pt-16">
          <ReactFlow
            nodes={nodes}
            edges={edges}
            nodeTypes={nodeTypes}
            defaultEdgeOptions={defaultEdgeOptions}
            onNodeClick={handleNodeClick}
            fitView
            minZoom={0.1}
            maxZoom={1.5}
            defaultViewport={defaultViewport}
            proOptions={proOptions}
          >
            <Background />
            <Controls />
            <Panel position="top-left" className="!bg-transparent">
              <MiniMap
                style={{
                  backgroundColor: "rgba(255, 255, 255, 0.9)",
                  border: "1px solid #e5e7eb",
                  borderRadius: "0.5rem",
                }}
                maskColor="rgba(0, 0, 0, 0.1)"
                className="shadow-md"
              />
            </Panel>
          </ReactFlow>
        </div>
      </div>
    );
  },
  (prevProps, nextProps) => {
    const prevGraph = prevProps.graph;
    const nextGraph = nextProps.graph;
    const structuralEqual =
      prevGraph.name === nextGraph.name &&
      prevGraph.fs === nextGraph.fs &&
      prevGraph.inputs.length === nextGraph.inputs.length &&
      prevGraph.outputs.length === nextGraph.outputs.length &&
      prevGraph.nodes.length === nextGraph.nodes.length &&
      prevGraph.nodes.every((node, i) => {
        const nextNode = nextGraph.nodes[i];
        return (
          node.placement.name === nextNode.placement.name &&
          node.placement.thread === nextNode.placement.thread &&
          node.op_type === nextNode.op_type &&
          JSON.stringify(node.placement.input) ===
            JSON.stringify(nextNode.placement.input) &&
          JSON.stringify(node.placement.output) ===
            JSON.stringify(nextNode.placement.output)
        );
      });

    return structuralEqual;
  }
);