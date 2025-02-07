import { Loader2 } from "lucide-react"

export default function LoadingScreen() {
  return (
    <div className="fixed inset-0 flex items-center justify-center bg-background">
      <div className="flex flex-col items-center gap-4 animate-fade-in">
        <Loader2 className="h-12 w-12 animate-spin text-gray-500" />
        <p className="text-gray-500 text-lg">Loading your audio graph...</p>
      </div>
    </div>
  )
} 