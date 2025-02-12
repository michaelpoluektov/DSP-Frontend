import { Download } from "lucide-react"
import { theme } from "../styles/theme"
import { downloadGraphSource } from "../utils/api"
import { type Graph } from "../types/graph"

interface DownloadButtonProps {
  graph: Graph
}

const DownloadButton = ({ graph }: DownloadButtonProps) => {
  const handleDownload = async () => {
    try {
      const blob = await downloadGraphSource()
      const url = window.URL.createObjectURL(blob)
      const a = document.createElement('a')
      a.href = url
      // Convert graph name to snake case for filename
      const filename = graph.name.toLowerCase().replace(/[^\w]+/g, '_')
      a.download = `${filename}.zip`
      document.body.appendChild(a)
      a.click()
      window.URL.revokeObjectURL(url)
      document.body.removeChild(a)
    } catch (error) {
      console.error('Failed to download graph source:', error)
    }
  }

  return (
    <button
      className="fixed bottom-4 right-4 bg-gray-50 hover:bg-gray-100 border-2 border-[#00B6B0] p-3 shadow-lg transition-colors duration-200 z-50"
      onClick={handleDownload}
    >
      <Download size={24} className="text-gray-600" />
    </button>
  )
}

export default DownloadButton 