import { useState } from "react"
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
}

export default function Sidebar({ isOpen, graph, onNodeUpdate, onParametricEqOpen }: SidebarProps) {
  const [openNode, setOpenNode] = useState<string | null>(null)

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
        ${theme.shadow} transition-all duration-150 ease-in-out
        ${isOpen ? "w-64 h-[calc(100vh-4rem)]" : "w-0"}
      `}
    >
      <div
        className={`${isOpen ? "opacity-100" : "opacity-0"} transition-opacity duration-150 ${isOpen ? "" : "pointer-events-none"}`}
      >
        <h2
          className={`${theme.fonts.subtitle} ${theme.colors.text.primary} ${theme.emphasis.background} ${theme.emphasis.padding} ${theme.rounded} ${theme.textEffect.shadow} mb-4`}
        >
          Options
        </h2>
        {graph.nodes.map((node) => (
          <div key={node.placement.name} className="mb-2">
            <button
              onClick={() => toggleNode(node.placement.name)}
              className={`w-full flex items-center justify-between ${theme.colors.button.primary} ${theme.spacing.sm} ${theme.rounded} ${theme.borderWidth} ${theme.colors.border} ${theme.shadow}`}
            >
              <span className={theme.colors.text.primary}>{node.placement.name}</span>
              {openNode === node.placement.name ? <ChevronDown size={20} /> : <ChevronRight size={20} />}
            </button>
            <div
              className={`
                mt-2 overflow-hidden transition-all duration-150 ease-out
                ${openNode === node.placement.name ? 'max-h-[500px] opacity-100' : 'max-h-0 opacity-0'}
              `}
            >
              <div className={`${theme.spacing.sm} ${theme.colors.secondary} ${theme.rounded} ${theme.borderWidth} ${theme.colors.border} ${theme.shadow}`}>
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

