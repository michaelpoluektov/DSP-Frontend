import { Menu } from "lucide-react"
import { commonStyles } from "../styles/common"

interface TopBarProps {
  onToggleSidebar: () => void
}

export default function TopBar({ onToggleSidebar }: TopBarProps) {
  return (
    <div
      className={`${commonStyles.container.primary} flex justify-between items-center border-t-0 border-x-0`}
    >
      <h1 className={commonStyles.text.title}>
        DSP Tool
      </h1>
      <button
        onClick={onToggleSidebar}
        className={commonStyles.button.icon}
      >
        <Menu size={24} />
      </button>
    </div>
  )
}

