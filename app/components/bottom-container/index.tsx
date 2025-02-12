import { theme } from "../../styles/theme"
import { Graph, Node } from "../../types/graph"
import { useState, useEffect } from "react"
import EQResponseGraph from "./EQResponseGraph"

interface BottomContainerProps {
  isOpen: boolean
  graph: Graph
  onNodeUpdate: (updatedNode: Node) => void
  selectedNode: string | null
  onNodeSelect: (nodeName: string) => void
}

export default function BottomContainer({ 
  isOpen, 
  graph, 
  onNodeUpdate, 
  selectedNode,
  onNodeSelect 
}: BottomContainerProps) {
  const [activeTab, setActiveTab] = useState<string | null>(null)
  
  // Find all parametric EQ and Biquad nodes
  const eqNodes = graph.nodes.filter(node => 
    node.op_type === "ParametricEq" || node.op_type === "Biquad"
  )

  // Update active tab when selected node changes or when tab is clicked
  useEffect(() => {
    const selectedNodeData = graph.nodes.find(node => node.placement.name === selectedNode)
    if (selectedNodeData && (selectedNodeData.op_type === "ParametricEq" || selectedNodeData.op_type === "Biquad")) {
      setActiveTab(selectedNode)
    } else if (!activeTab && eqNodes.length > 0 && isOpen) {
      setActiveTab(eqNodes[0].placement.name)
    }
  }, [selectedNode, eqNodes, isOpen, activeTab, graph.nodes])

  const activeNode = eqNodes.find(node => node.placement.name === activeTab)
  
  // Trigger a resize event when the container opens/closes
  useEffect(() => {
    window.dispatchEvent(new Event('resize'))
  }, [isOpen])

  return (
    <div
      className={`${theme.colors.secondary} transition-all duration-300 ease-in-out ${isOpen ? "h-64" : "h-0"} ${theme.borderWidth} ${theme.colors.border} border-b-0 border-x-0 ${theme.shadow} overflow-hidden`}
    >
      <div className={`flex items-center ${theme.colors.button.secondary} ${theme.borderWidth} ${theme.colors.border} border-t-0 border-x-0 ${theme.shadow}`}>
        {isOpen && eqNodes.length > 0 && (
          <div className="flex gap-2 px-2 h-8 items-center flex-1">
            {eqNodes.map((node) => (
              <button
                key={node.placement.name}
                onClick={() => onNodeSelect(node.placement.name)}
                className={`px-2 py-0.5 rounded-md transition-colors duration-200 text-xs ${
                  activeTab === node.placement.name
                    ? `${theme.colors.button.primary} ${theme.colors.text.primary} ${theme.borderWidth} ${theme.colors.border}`
                    : `${theme.colors.button.secondary} ${theme.colors.text.secondary}`
                }`}
              >
                {node.placement.name} ({node.op_type})
              </button>
            ))}
          </div>
        )}
      </div>
      {isOpen && (
        <div className={`${theme.spacing.md} overflow-y-auto scrollbar-hidden h-[calc(100%-2rem)]`}>
          {eqNodes.length > 0 && activeNode ? (
            <div className={`${theme.colors.tertiary} ${theme.spacing.md} ${theme.rounded} ${theme.borderWidth} ${theme.colors.border} ${theme.shadow} h-full`}>
              <EQResponseGraph node={activeNode} />
            </div>
          ) : (
            <div className={`${theme.colors.tertiary} ${theme.spacing.md} ${theme.rounded} ${theme.borderWidth} ${theme.colors.border} ${theme.shadow} flex items-center justify-center h-full`}>
              <p className={`${theme.colors.text.secondary}`}>No EQ or Biquad nodes found in the graph</p>
            </div>
          )}
        </div>
      )}
    </div>
  )
}