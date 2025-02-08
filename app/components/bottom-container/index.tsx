import { ChevronUp, ChevronDown } from "lucide-react"
import { theme } from "../../styles/theme"
import { Graph, Node, ParametricEq } from "../../types/graph"
import { useState, useEffect } from "react"
import EQResponseGraph from "./EQResponseGraph"
import { calculateEQResponse } from "../../utils/eqResponse"

interface BottomContainerProps {
  isOpen: boolean
  onToggle: () => void
  graph: Graph
  onNodeUpdate: (updatedNode: Node) => void
  isSidebarOpen: boolean
}

export default function BottomContainer({ isOpen, onToggle, graph, onNodeUpdate, isSidebarOpen }: BottomContainerProps) {
  const [activeTab, setActiveTab] = useState<string | null>(null)
  
  // Find all parametric EQ nodes
  const eqNodes = graph.nodes.filter(node => node.op_type === "ParametricEq") as ParametricEq[]

  // Set first EQ node as active tab when necessary
  useEffect(() => {
    if (!activeTab && eqNodes.length > 0 && isOpen) {
      setActiveTab(eqNodes[0].placement.name)
    }
  }, [eqNodes, isOpen, activeTab])

  const activeNode = eqNodes.find(node => node.placement.name === activeTab)
  
  // Debug logging for active node changes and magnitude response
  useEffect(() => {
    if (activeNode?.parameters?.filters) {
      calculateEQResponse({ filters: activeNode.parameters.filters })
        .then(response => {
          console.log('EQ Response:', {
            name: activeNode.placement.name,
            frequencies: response.frequencies,
            magnitudes: response.magnitudes
          });
        });
    }
  }, [activeNode])

  // Trigger a resize event when the sidebar state changes
  useEffect(() => {
    window.dispatchEvent(new Event('resize'))
  }, [isSidebarOpen])

  return (
    <div
      className={`${theme.colors.secondary} transition-all duration-300 ease-in-out ${isOpen ? "h-64" : "h-8"} ${theme.borderWidth} ${theme.colors.border} border-b-0 border-x-0 ${theme.shadow}`}
    >
      <div className={`flex items-center ${theme.colors.button.secondary} ${theme.borderWidth} ${theme.colors.border} border-t-0 border-x-0 ${theme.shadow}`}>
        <button
          className={`h-8 w-8 flex items-center justify-center hover:${theme.colors.button.primary} transition-colors duration-200`}
          onClick={onToggle}
        >
          {isOpen ? <ChevronDown size={16} /> : <ChevronUp size={16} />}
        </button>
        {isOpen && eqNodes.length > 0 && (
          <div className="flex gap-2 px-2 h-8 items-center flex-1">
            {eqNodes.map((node) => (
              <button
                key={node.placement.name}
                onClick={() => setActiveTab(node.placement.name)}
                className={`px-2 py-0.5 rounded-md transition-colors duration-200 text-xs ${
                  activeTab === node.placement.name
                    ? `${theme.colors.button.primary} ${theme.colors.text.primary} ${theme.borderWidth} ${theme.colors.border}`
                    : `${theme.colors.button.secondary} ${theme.colors.text.secondary}`
                }`}
              >
                {node.placement.name}
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
              <p className={`${theme.colors.text.secondary}`}>No parametric EQ nodes found in the graph</p>
            </div>
          )}
        </div>
      )}
    </div>
  )
}