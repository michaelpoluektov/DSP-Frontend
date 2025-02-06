import { NextResponse } from "next/server"
import { initialGraph } from "../../types/graph"

export async function GET() {
  // Simulate a delay to mimic a real API call
  await new Promise((resolve) => setTimeout(resolve, 500))

  // Return the initial graph as if it was fetched from the backend
  return NextResponse.json(initialGraph)
}

