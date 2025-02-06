import { ChevronUp, ChevronDown } from "lucide-react"
import { theme } from "../styles/theme"

interface BottomContainerProps {
  isOpen: boolean
  onToggle: () => void
}

export default function BottomContainer({ isOpen, onToggle }: BottomContainerProps) {
  return (
    <div
      className={`${theme.colors.secondary} transition-all duration-300 ease-in-out ${isOpen ? "h-64" : "h-12"} ${theme.borderWidth} ${theme.colors.border} border-b-0 border-x-0 ${theme.shadow}`}
    >
      <button
        className={`w-full h-12 flex items-center justify-center ${theme.colors.button.secondary} transition-colors duration-200 ${theme.borderWidth} ${theme.colors.border} border-t-0 border-x-0 ${theme.shadow}`}
        onClick={onToggle}
      >
        {isOpen ? <ChevronDown size={24} /> : <ChevronUp size={24} />}
      </button>
      {isOpen && (
        <div className={`${theme.spacing.md} overflow-y-auto scrollbar-hidden h-52`}>
          <h2
            className={`${theme.fonts.subtitle} ${theme.colors.text.primary} ${theme.emphasis.background} ${theme.emphasis.padding} ${theme.rounded} ${theme.textEffect.shadow} mb-4`}
          >
            Advanced Config Options
          </h2>
          <div
            className={`${theme.colors.tertiary} ${theme.spacing.md} ${theme.rounded} ${theme.borderWidth} ${theme.colors.border} ${theme.shadow}`}
          >
            <p className={`${theme.colors.text.secondary}`}>Advanced options placeholder</p>
          </div>
        </div>
      )}
    </div>
  )
}

