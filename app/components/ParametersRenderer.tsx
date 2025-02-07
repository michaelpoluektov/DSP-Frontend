import { theme } from "../styles/theme"
import { parameterConfigs } from "../utils/parameterTypes"
import SliderParameter from "./parameters/SliderParameter"
import IntegerParameter from "./parameters/IntegerParameter"
import BooleanParameter from "./parameters/BooleanParameter"

interface ParametersRendererProps {
  nodeType: string
  parameters: Record<string, number | boolean>
  onParameterChange: (paramName: string, value: number | boolean) => void
}

export default function ParametersRenderer({ nodeType, parameters, onParameterChange }: ParametersRendererProps) {
  const configs = parameterConfigs[nodeType] || {}

  return (
    <div
      className={`${theme.colors.tertiary} ${theme.spacing.sm} ${theme.rounded} ${theme.borderWidth} ${theme.colors.border}`}
    >
      <h4 className={`${theme.fonts.heading} ${theme.colors.text.primary} text-sm mb-2`}>Parameters</h4>
      {Object.entries(parameters).map(([key, value]) => {
        const config = configs[key]
        if (!config) return null

        switch (config.type) {
          case 'slider':
            return (
              <SliderParameter
                key={key}
                name={key}
                value={value as number}
                config={config}
                onChange={(newValue) => onParameterChange(key, newValue)}
              />
            )
          case 'integer':
            return (
              <IntegerParameter
                key={key}
                name={key}
                value={value as number}
                config={config}
                onChange={(newValue) => onParameterChange(key, newValue)}
              />
            )
          case 'boolean':
            return (
              <BooleanParameter
                key={key}
                name={key}
                value={value as boolean}
                config={config}
                onChange={(newValue) => onParameterChange(key, newValue)}
              />
            )
          default:
            return null
        }
      })}
    </div>
  )
}

