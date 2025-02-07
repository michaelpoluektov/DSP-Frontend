import { theme } from "../styles/theme"

interface ConfigRendererProps {
  config?: Record<string, any>
}

function formatValue(value: any): string {
  if (typeof value === 'number') {
    // Format numbers with up to 3 decimal places if they have decimals
    return Number.isInteger(value) ? value.toString() : value.toFixed(3)
  }
  if (typeof value === 'boolean') {
    return value ? 'true' : 'false'
  }
  if (Array.isArray(value)) {
    return `[${value.map(formatValue).join(', ')}]`
  }
  if (typeof value === 'object' && value !== null) {
    return JSON.stringify(value, null, 2)
  }
  return String(value)
}

function ConfigValue({ name, value }: { name: string; value: any }) {
  return (
    <div className="flex items-start gap-2 py-1">
      <span className={`${theme.colors.text.primary} text-xs font-medium min-w-[100px]`}>
        {name}:
      </span>
      <span className={`${theme.colors.text.secondary} text-xs font-mono break-all`}>
        {formatValue(value)}
      </span>
    </div>
  )
}

export default function ConfigRenderer({ config }: ConfigRendererProps) {
  if (!config || Object.keys(config).length === 0) {
    return null
  }

  return (
    <div
      className={`${theme.colors.tertiary} ${theme.spacing.sm} ${theme.rounded} ${theme.borderWidth} ${theme.colors.border}`}
    >
      <h4 className={`${theme.fonts.heading} ${theme.colors.text.primary} text-sm mb-2`}>Config</h4>
      <div className="space-y-1">
        {Object.entries(config).map(([key, value]) => (
          <ConfigValue key={key} name={key} value={value} />
        ))}
      </div>
    </div>
  )
}

