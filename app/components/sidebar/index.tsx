import { useState, useEffect } from "react"
import { ChevronRight, ChevronDown } from "lucide-react"
import { theme } from "../../styles/theme"
import type { Graph, Node, BiquadFilterType } from "../../types/graph"
import ConfigRenderer from "./ConfigRenderer"
import ParametersRenderer from "./ParametersRenderer"

interface SidebarProps {
  isOpen: boolean
  graph: Graph
  onNodeUpdate: (updatedNode: Node) => void
  onParametricEqOpen?: () => void
  selectedNode?: string | null
}

export default function Sidebar({ isOpen, graph, onNodeUpdate, onParametricEqOpen, selectedNode }: SidebarProps) {
  const [openNode, setOpenNode] = useState<string | null>(null)

  useEffect(() => {
    if (selectedNode) {
      setOpenNode(selectedNode)
    }
  }, [selectedNode])

  const toggleNode = (name: string) => {
    const node = graph.nodes.find((n) => n.placement.name === name)
    if (node?.op_type === "ParametricEq" && onParametricEqOpen) {
      onParametricEqOpen()
    }
    setOpenNode((prev) => (prev === name ? null : name))
  }

  const handleParameterChange = (nodeName: string, paramName: string, value: any) => {
    const updatedNode = graph.nodes.find((node) => node.placement.name === nodeName)
    if (updatedNode && "parameters" in updatedNode) {
      const newNode = {
        ...updatedNode,
        parameters: {
          ...updatedNode.parameters,
          [paramName]: value,
        },
      }
      onNodeUpdate(newNode as Node)
    }
  }

  return (
    <div
      className={`
        ${theme.colors.tertiary} ${theme.spacing.md} 
        overflow-y-auto hover:scrollbar-visible scrollbar-hidden ${theme.borderWidth} ${theme.colors.border} border-t-0 border-r-0 border-b-0 
        ${theme.shadow} transition-all duration-150 ease-in-out pt-2.5
        ${isOpen ? "w-64 h-[calc(100vh-3.0rem)]" : "w-0"}
      `}
    >
      <div
        className={`${isOpen ? "opacity-100" : "opacity-0"} transition-opacity duration-150 ${isOpen ? "" : "pointer-events-none"}`}
      >
        <h4
          className={`${theme.fonts.subtitle} ${theme.colors.text.primary} ${theme.emphasis.background} ${theme.emphasis.padding} ${theme.rounded} ${theme.textEffect.shadow} border ${theme.colors.border} mb-1`}
        >
          Options
        </h4>
        {graph.nodes.map((node) => (
          <div key={node.placement.name} className="mb-0.5">
            <button
              onClick={() => toggleNode(node.placement.name)}
              className={`w-full flex items-center justify-between bg-gray-50 hover:bg-gray-100 ${theme.spacing.sm} ${theme.rounded} ${theme.borderWidth} ${theme.colors.border} ${theme.shadow}`}
            >
              <span className={`${theme.colors.text.primary} text-sm`}>{node.placement.name}</span>
              {openNode === node.placement.name ? <ChevronDown size={20} /> : <ChevronRight size={20} />}
            </button>
            <div
              className={`
                mt-1 overflow-hidden transition-all duration-150 ease-out
                ${openNode === node.placement.name ? 'max-h-[calc(100vh-12rem)] opacity-100' : 'max-h-0 opacity-0'}
              `}
            >
              <div className={`${theme.spacing.sm} ${theme.colors.secondary} ${theme.rounded} ${theme.borderWidth} ${theme.colors.border} ${theme.shadow} mb-0.5`}>
                {"config" in node && <ConfigRenderer config={node.config} />}
                {"parameters" in node && node.parameters && (
                  <ParametersRenderer
                    nodeType={node.op_type}
                    parameters={node.parameters}
                    onParameterChange={(paramName, value) =>
                      handleParameterChange(node.placement.name, paramName, value)
                    }
                  />
                )}
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  )
}

