import { Menu } from "lucide-react"
import { theme } from "../styles/theme"

interface TopBarProps {
  onToggleSidebar: () => void
}

export default function TopBar({ onToggleSidebar }: TopBarProps) {
  return (
    <div
      className={`${theme.colors.primary} ${theme.colors.text.primary} ${theme.spacing.md} flex justify-between items-center ${theme.borderWidth} ${theme.colors.border} border-t-0 border-x-0 ${theme.shadow}`}
    >
      <h1
        className={`${theme.fonts.title} ${theme.colors.text.primary} ${theme.emphasis.background} ${theme.emphasis.padding} ${theme.rounded} ${theme.textEffect.shadow}`}
      >
        DSP Tool
      </h1>
      <button
        onClick={onToggleSidebar}
        className={`${theme.colors.button.secondary} ${theme.rounded} ${theme.spacing.sm} ${theme.shadow}`}
      >
        <Menu size={24} />
      </button>
    </div>
  )
}

