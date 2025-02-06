const API_BASE_URL = "http://localhost:8000"
const SESSION_ID = "42"

export async function fetchGraph() {
  const response = await fetch(`${API_BASE_URL}/api/graph?session=${SESSION_ID}`)
  if (!response.ok) {
    throw new Error("Failed to fetch graph")
  }
  return response.json()
}

export async function updateGraph(graph: any) {
  const response = await fetch(`${API_BASE_URL}/api/graph?session=${SESSION_ID}`, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
    },
    body: JSON.stringify(graph),
  })
  if (!response.ok) {
    throw new Error("Failed to update graph")
  }
  return response.json()
}

export function subscribeToGraphUpdates(callback: (graph: any) => void) {
  const eventSource = new EventSource(`${API_BASE_URL}/api/graph-updates?session=${SESSION_ID}`)
  eventSource.onmessage = (event) => {
    const updatedGraph = JSON.parse(event.data)
    callback(updatedGraph)
  }
  return () => eventSource.close()
}

