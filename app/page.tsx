"use client"

import { useCallback, useEffect, useState } from "react"
import BottomContainer from "./components/BottomContainer"
import Graph from "./components/Graph"
import Sidebar from "./components/Sidebar"
import TopBar from "./components/TopBar"
import { theme } from "./styles/theme"
import { type Graph as GraphType, initialGraph, type Node } from "./types/graph"
import { fetchGraph, subscribeToGraphUpdates, updateGraph as updateGraphInBackend } from "./utils/api"
import { debounce } from "./utils/debounce"

export default function Home() {
  const [isBottomContainerOpen, setIsBottomContainerOpen] = useState(false)
  const [isSidebarOpen, setIsSidebarOpen] = useState(true)
  const [graph, setGraph] = useState<GraphType>(initialGraph)

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

  useEffect(() => {
    const fetchInitialGraph = async () => {
      try {
        const data = await fetchGraph()
        updateLocalGraph(data)
      } catch (error) {
        console.error("Error fetching graph:", error)
        updateLocalGraph(initialGraph)
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

  return (
    <div className={`flex flex-col h-screen ${theme.fonts.body} ${theme.colors.background}`}>
      <TopBar onToggleSidebar={() => setIsSidebarOpen(!isSidebarOpen)} />
      <div className="flex flex-1 overflow-hidden">
        <div className="flex-1 flex flex-col">
          <Graph graph={graph} />
          <BottomContainer
            isOpen={isBottomContainerOpen}
            onToggle={() => setIsBottomContainerOpen(!isBottomContainerOpen)}
          />
        </div>
        <Sidebar isOpen={isSidebarOpen} graph={graph} onNodeUpdate={handleNodeUpdate} />
      </div>
    </div>
  )
}

