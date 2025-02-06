"use client"

import { useState, useEffect, useCallback } from "react"
import TopBar from "./components/TopBar"
import Sidebar from "./components/Sidebar"
import Graph from "./components/Graph"
import BottomContainer from "./components/BottomContainer"
import { theme } from "./styles/theme"
import { type Graph as GraphType, initialGraph, type Node } from "./types/graph"
import { debounce } from "./utils/debounce"

export default function Home() {
  const [isBottomContainerOpen, setIsBottomContainerOpen] = useState(false)
  const [isSidebarOpen, setIsSidebarOpen] = useState(true)
  const [graph, setGraph] = useState<GraphType>(initialGraph)

  const updateGraph = useCallback((updatedGraph: GraphType) => {
    setGraph(updatedGraph)
  }, [])

  const syncGraphWithBackend = useCallback(
    debounce(async (graphToSync: GraphType) => {
      try {
        const response = await fetch("/api/graph", {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify(graphToSync),
        })
        if (!response.ok) {
          throw new Error("Failed to sync graph with backend")
        }
        console.log("Graph synced with backend")
      } catch (error) {
        console.error("Error syncing graph with backend:", error)
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
    const fetchGraph = async () => {
      try {
        const response = await fetch("/api/graph")
        if (!response.ok) {
          throw new Error("Failed to fetch graph")
        }
        const data = await response.json()
        updateGraph(data)
      } catch (error) {
        console.error("Error fetching graph:", error)
        updateGraph(initialGraph)
      }
    }

    fetchGraph()

    const eventSource = new EventSource("/api/graph-updates")
    eventSource.onmessage = (event) => {
      const updatedGraph = JSON.parse(event.data)
      updateGraph(updatedGraph)
    }

    return () => {
      eventSource.close()
    }
  }, [updateGraph])

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

