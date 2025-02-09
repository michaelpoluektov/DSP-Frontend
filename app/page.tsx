"use client"

import { useCallback, useEffect, useState } from "react"
import { ReactFlowProvider } from "reactflow"
import BottomContainer from "./components/bottom-container"
import Graph from "./components/Graph"
import LoadingScreen from "./components/LoadingScreen"
import Sidebar from "./components/sidebar"
import TopBar from "./components/TopBar/index"
import { theme } from "./styles/theme"
import { type Graph as GraphType, type Node } from "./types/graph"
import { fetchGraph, subscribeToGraphUpdates, updateGraph as updateGraphInBackend } from "./utils/api"
import { debounce } from "./utils/debounce"

export default function Home() {
  const [isBottomContainerOpen, setIsBottomContainerOpen] = useState(false)
  const [isSidebarOpen, setIsSidebarOpen] = useState(true)
  const [graph, setGraph] = useState<GraphType | null>(null)
  const [isLoading, setIsLoading] = useState(true)
  const [selectedNode, setSelectedNode] = useState<string | null>(null)

  const updateLocalGraph = useCallback((updatedGraph: GraphType) => {
    setGraph(updatedGraph)
  }, [])

  const syncGraphWithBackend = useCallback(
    debounce(async (graphToSync: GraphType) => {
      try {
        await updateGraphInBackend(graphToSync)
        console.log("Graph synced with backend")
      } catch (error) {
        console.error("Error syncing graph with backend.")
      }
    }, 500),
    [],
  )

  const handleNodeUpdate = useCallback(
    (updatedNode: Node) => {
      setGraph((prevGraph) => {
        if (!prevGraph) return null
        const newGraph = {
          ...prevGraph,
          nodes: prevGraph.nodes.map((node) =>
            node.placement.name === updatedNode.placement.name ? updatedNode : node,
          ),
        }
        syncGraphWithBackend(newGraph)
        return newGraph
      })
    },
    [syncGraphWithBackend],
  )

  const handleNodeSelect = useCallback((nodeName: string) => {
    setSelectedNode(nodeName)
    setIsSidebarOpen(true)
  }, [])

  useEffect(() => {
    const fetchInitialGraph = async () => {
      try {
        const data = await fetchGraph()
        updateLocalGraph(data)
      } catch (error) {
        console.error("Error fetching graph:", error)
      } finally {
        setIsLoading(false)
      }
    }

    fetchInitialGraph()

    const unsubscribe = subscribeToGraphUpdates((updatedGraph) => {
      updateLocalGraph(updatedGraph)
    })

    return () => {
      unsubscribe()
    }
  }, [updateLocalGraph])

  if (isLoading || !graph) {
    return <LoadingScreen />
  }

  return (
    <div className={`flex flex-col h-screen ${theme.fonts.body} ${theme.colors.background} animate-fade-in`}>
      {
      <TopBar onToggleSidebar={() => setIsSidebarOpen(!isSidebarOpen)} graph={graph} />
      }
      <div className="flex flex-1 overflow-hidden">
        <div className="flex-1 flex flex-col min-w-0">
          <ReactFlowProvider>
            <Graph 
              graph={graph} 
              onNodeSelect={handleNodeSelect}
              onParametricEqOpen={() => setIsBottomContainerOpen(true)}
            />
          </ReactFlowProvider>
          <BottomContainer
            isOpen={isBottomContainerOpen}
            onToggle={() => setIsBottomContainerOpen(!isBottomContainerOpen)}
            graph={graph}
            onNodeUpdate={handleNodeUpdate}
            isSidebarOpen={isSidebarOpen}
          />
        </div>
        <Sidebar 
          isOpen={isSidebarOpen} 
          graph={graph} 
          onNodeUpdate={handleNodeUpdate}
          onParametricEqOpen={() => setIsBottomContainerOpen(true)}
          selectedNode={selectedNode}
        />
      </div>
    </div>
  )
}

