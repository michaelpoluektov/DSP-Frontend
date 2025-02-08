import { useCallback, useMemo } from "react"
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
} from "reactflow"
import "reactflow/dist/style.css"
import { theme } from "../styles/theme"
import type { Graph as GraphType, Node as DSPNode } from "../types/graph"

interface GraphProps {
  graph: GraphType
  onNodeSelect?: (nodeName: string) => void
  onParametricEqOpen?: () => void
}

// Custom node types
const BaseNode = ({ data, id }: NodeProps) => {
  const { op_type, parameters, config } = data
  return (
    <div className={`px-3 py-2 shadow-lg rounded-lg border ${theme.colors.border} bg-white`}>
      <div className="font-medium text-sm">{data.name}</div>
      <div className="text-xs text-gray-500">{op_type}</div>
      {data.inputs.map((_: number, index: number) => (
        <Handle
          key={`input-${index}`}
          type="target"
          position={Position.Left}
          id={`input-${index}`}
          className="w-2 h-2"
          style={{ top: `${25 + (index * 20)}%` }}
        />
      ))}
      {data.outputs.map((_: number, index: number) => (
        <Handle
          key={`output-${index}`}
          type="source"
          position={Position.Right}
          id={`output-${index}`}
          className="w-2 h-2"
          style={{ top: `${25 + (index * 20)}%` }}
        />
      ))}
    </div>
  )
}

const nodeTypes = {
  dspNode: BaseNode,
}

export default function Graph({ graph, onNodeSelect, onParametricEqOpen }: GraphProps) {
  const { fitView } = useReactFlow()

  const handleNodeClick = useCallback((event: React.MouseEvent, node: FlowNode) => {
    if (onNodeSelect && node.id !== 'input' && node.id !== 'output') {
      onNodeSelect(node.id)
      // Check if the clicked node is a ParametricEq node
      const dspNode = graph.nodes.find(n => n.placement.name === node.id)
      if (dspNode?.op_type === "ParametricEq" && onParametricEqOpen) {
        onParametricEqOpen()
      }
    }
  }, [onNodeSelect, onParametricEqOpen, graph.nodes])

  // Convert DSP nodes to React Flow nodes
  const nodes: FlowNode[] = useMemo(() => {
    return [
      // Input node
      {
        id: "input",
        type: "dspNode",
        position: { x: 0, y: 0 },
        data: {
          name: graph.input.name,
          op_type: "Input",
          inputs: [],
          outputs: graph.input.output,
        },
      },
      // DSP nodes
      ...graph.nodes.map((node: DSPNode, index) => ({
        id: node.placement.name,
        type: "dspNode",
        position: { x: 250 + (Math.floor(index / 3) * 200), y: (index % 3) * 150 },
        data: {
          name: node.placement.name,
          op_type: node.op_type,
          parameters: "parameters" in node ? node.parameters : undefined,
          config: "config" in node ? node.config : undefined,
          inputs: node.placement.input,
          outputs: node.placement.output,
        },
      })),
      // Output node
      {
        id: "output",
        type: "dspNode",
        position: { x: 250 + (Math.floor((graph.nodes.length + 2) / 3) * 200), y: 0 },
        data: {
          name: graph.output.name,
          op_type: "Output",
          inputs: graph.output.input,
          outputs: [],
        },
      },
    ]
  }, [graph])

  // Create edges based on input/output connections
  const edges: Edge[] = useMemo(() => {
    const allEdges: Edge[] = []

    // Helper function to create edges
    const createEdges = (sourceId: string, sourceOutputs: number[], targetId: string, targetInputs: number[]) => {
      const connections = sourceOutputs.reduce((acc: Edge[], outputNum, idx) => {
        const matchingInputIdx = targetInputs.findIndex(inputNum => inputNum === outputNum)
        if (matchingInputIdx !== -1) {
          acc.push({
            id: `${sourceId}-${outputNum}-${targetId}-${matchingInputIdx}`,
            source: sourceId,
            target: targetId,
            sourceHandle: `output-${idx}`,
            targetHandle: `input-${matchingInputIdx}`,
            type: "smoothstep",
          })
        }
        return acc
      }, [])
      return connections
    }

    // Connect input to nodes
    graph.nodes.forEach(node => {
      allEdges.push(...createEdges("input", graph.input.output, node.placement.name, node.placement.input))
    })

    // Connect nodes to each other
    graph.nodes.forEach(sourceNode => {
      graph.nodes.forEach(targetNode => {
        if (sourceNode.placement.name !== targetNode.placement.name) {
          allEdges.push(...createEdges(sourceNode.placement.name, sourceNode.placement.output, targetNode.placement.name, targetNode.placement.input))
        }
      })
    })

    // Connect nodes to output
    graph.nodes.forEach(node => {
      allEdges.push(...createEdges(node.placement.name, node.placement.output, "output", graph.output.input))
    })

    return allEdges
  }, [graph])

  const onInit = useCallback(() => {
    setTimeout(() => {
      fitView({ padding: 0.2 })
    }, 0)
  }, [fitView])

  return (
    <div className={`flex-1 ${theme.colors.primary} ${theme.spacing.md} overflow-hidden relative`}>
      <h2
        className={`${theme.fonts.subtitle} ${theme.colors.text.primary} ${theme.emphasis.background} ${theme.emphasis.padding} ${theme.rounded} ${theme.textEffect.shadow} mb-4 z-10 relative`}
      >
        {graph.name}
      </h2>
      <div className="absolute inset-0 pt-16">
        <ReactFlow
          nodes={nodes}
          edges={edges}
          nodeTypes={nodeTypes}
          onInit={onInit}
          onNodeClick={handleNodeClick}
          fitView
          minZoom={0.1}
          maxZoom={1.5}
          defaultViewport={{ x: 0, y: 0, zoom: 0.5 }}
          proOptions={{ hideAttribution: true }}
        >
          <Background />
          <Controls />
          <Panel position="top-left" className="!bg-transparent">
            <MiniMap 
              style={{ 
                backgroundColor: 'rgba(255, 255, 255, 0.9)',
                border: '1px solid #e5e7eb',
                borderRadius: '0.5rem',
              }}
              maskColor="rgba(0, 0, 0, 0.1)"
              className="shadow-md"
            />
          </Panel>
        </ReactFlow>
      </div>
      <div
        className={`absolute top-16 right-2 bg-white/90 backdrop-blur-sm ${theme.spacing.md} ${theme.rounded} ${theme.borderWidth} ${theme.colors.border} ${theme.shadow} max-w-xs transition-all duration-200 ease-in-out hover:scale-105 z-10`}
      >
        <h3 className={`${theme.fonts.heading} ${theme.colors.text.primary} text-sm mb-2`}>Graph Info</h3>
        <p className={`${theme.colors.text.secondary} text-xs mb-1`}>Nodes: {graph.nodes.length}</p>
        <p className={`${theme.colors.text.secondary} text-xs mb-1`}>Input Channels: {graph.input.channels}</p>
        <p className={`${theme.colors.text.secondary} text-xs mb-1`}>Output Channels: {graph.output.channels}</p>
        <p className={`${theme.colors.text.secondary} text-xs`}>Sample Rate: {graph.input.fs} Hz</p>
      </div>
    </div>
  )
}

