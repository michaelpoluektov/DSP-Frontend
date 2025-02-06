import { theme } from "../styles/theme"

interface ConfigRendererProps {
  config: any
}

export default function ConfigRenderer({ config }: ConfigRendererProps) {
  return (
    <div
      className={`${theme.colors.tertiary} ${theme.spacing.sm} ${theme.rounded} ${theme.borderWidth} ${theme.colors.border}`}
    >
      <h4 className={`${theme.fonts.heading} ${theme.colors.text.primary} text-sm mb-2`}>Config</h4>
      <pre className={`${theme.colors.text.secondary} text-xs overflow-x-auto`}>{JSON.stringify(config, null, 2)}</pre>
    </div>
  )
}

