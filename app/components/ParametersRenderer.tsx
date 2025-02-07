import { theme } from "../styles/theme"
import { parameterConfigs, ParameterConfig } from "../utils/parameterTypes"
import SliderParameter from "./parameters/SliderParameter"
import IntegerParameter from "./parameters/IntegerParameter"
import BooleanParameter from "./parameters/BooleanParameter"
import ParametricEqParameter from "./parameters/ParametricEqParameter"
import { BiquadFilterType } from "../types/graph"

interface ParametersRendererProps {
  nodeType: string
  parameters: Record<string, any>
  onParameterChange: (name: string, value: any) => void
}

// Helper function to determine parameter type based on value and config
function getParameterType(value: any, config: ParameterConfig | undefined): string {
  // Special case for ParametricEq filters
  if (Array.isArray(value) && value.every(v => typeof v === 'object' && 'type' in v)) {
    return 'parametric_eq'
  }

  // Use config type if available
  if (config?.type) {
    return config.type
  }

  // Infer type from value
  if (typeof value === 'boolean') {
    return 'boolean'
  }
  if (typeof value === 'number') {
    return Number.isInteger(value) ? 'integer' : 'slider'
  }

  // Default to 'unknown' if we can't determine the type
  return 'unknown'
}

export default function ParametersRenderer({ nodeType, parameters, onParameterChange }: ParametersRendererProps) {
  const configs = parameterConfigs[nodeType] || {}

  return (
    <div
      className={`${theme.colors.tertiary} ${theme.spacing.sm} ${theme.rounded} ${theme.borderWidth} ${theme.colors.border}`}
    >
      <h4 className={`${theme.fonts.heading} ${theme.colors.text.primary} text-sm mb-2`}>Parameters</h4>
      {Object.entries(parameters).map(([name, value]) => {
        const config = configs[name]
        const paramType = getParameterType(value, config)
        const defaultConfig = {
          min: typeof value === 'number' ? Math.min(0, value) : 0,
          max: typeof value === 'number' ? Math.max(1, value * 2) : 1,
          step: Number.isInteger(value) ? 1 : 0.01,
          title: name,
          type: paramType
        }
        const finalConfig = config || defaultConfig

        // Special case for ParametricEq filters
        if (nodeType === "ParametricEq" && name === "filters") {
          return (
            <ParametricEqParameter
              key={name}
              name={name}
              value={value as BiquadFilterType[]}
              config={finalConfig}
              onChange={(newValue) => onParameterChange(name, newValue)}
            />
          )
        }

        switch (paramType) {
          case 'boolean':
            return (
              <BooleanParameter
                key={name}
                name={name}
                value={value as boolean}
                config={finalConfig}
                onChange={(newValue) => onParameterChange(name, newValue)}
              />
            )
          case 'integer':
            return (
              <IntegerParameter
                key={name}
                name={name}
                value={value as number}
                config={finalConfig}
                onChange={(newValue) => onParameterChange(name, newValue)}
              />
            )
          case 'slider':
            return (
              <SliderParameter
                key={name}
                name={name}
                value={value as number}
                config={finalConfig}
                onChange={(newValue) => onParameterChange(name, newValue)}
              />
            )
          case 'unknown':
            // For unknown types, render a disabled text representation
            return (
              <div key={name} className={`${theme.colors.primary} ${theme.borderWidth} ${theme.colors.border} ${theme.rounded} px-2 py-1 mb-2`}>
                <div className={`${theme.colors.text.secondary} text-xs`}>{name}</div>
                <div className={`${theme.colors.text.primary} text-xs font-mono mt-1`}>
                  {JSON.stringify(value)}
                </div>
              </div>
            )
          default:
            return null
        }
      })}
    </div>
  )
}

