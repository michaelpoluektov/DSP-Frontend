import { theme } from "../styles/theme"

interface ParametersRendererProps {
  parameters: any
  onParameterChange: (paramName: string, value: any) => void
}

export default function ParametersRenderer({ parameters, onParameterChange }: ParametersRendererProps) {
  return (
    <div
      className={`${theme.colors.tertiary} ${theme.spacing.sm} ${theme.rounded} ${theme.borderWidth} ${theme.colors.border}`}
    >
      <h4 className={`${theme.fonts.heading} ${theme.colors.text.primary} text-sm mb-2`}>Parameters</h4>
      {Object.entries(parameters).map(([key, value]) => (
        <div key={key} className="mb-2">
          <label className={`${theme.colors.text.secondary} text-xs block mb-1`}>{key}</label>
          <input
            type="number"
            value={value as number}
            onChange={(e) => onParameterChange(key, Number.parseFloat(e.target.value))}
            className={`w-full ${theme.colors.primary} ${theme.colors.text.primary} ${theme.borderWidth} ${theme.colors.border} ${theme.rounded} px-2 py-1 text-xs`}
          />
        </div>
      ))}
    </div>
  )
}

