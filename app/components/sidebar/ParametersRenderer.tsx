import { theme } from "../../styles/theme"
import { parameterConfigs, ParameterConfig } from "../../utils/parameterTypes"
import SliderParameter from "./parameters/SliderParameter"
import IntegerParameter from "./parameters/IntegerParameter"
import BooleanParameter from "./parameters/BooleanParameter"
import ParametricEqParameter from "./parameters/ParametricEqParameter"
import { BiquadFilterType } from "../../types/graph"
import BiquadParameter from "./parameters/BiquadParameter"

interface ParametersRendererProps {
  nodeType: string
  parameters: Record<string, any>
  onParameterChange: (name: string, value: any) => void
}

// Helper function to determine parameter type based on value and config
function getParameterType(value: any, config: ParameterConfig | undefined): string {
  // Add check for single BiquadFilter
  if (typeof value === 'object' && 'type' in value) {
    return 'biquad'
  }

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
  
  // Don't render anything if there are no parameters and no configs
  if (Object.keys(parameters).length === 0 && Object.keys(configs).length === 0) {
    return null
  }

  return (
    <div
      className={`${theme.colors.tertiary} ${theme.spacing.sm} ${theme.rounded} ${theme.borderWidth} ${theme.colors.border}`}
    >
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

        // Add case for single BiquadFilter
        if (paramType === 'biquad') {
          return (
            <BiquadParameter
              key={name}
              name={name}
              value={value as BiquadFilterType}
              config={finalConfig}
              onChange={(newValue) => onParameterChange(name, newValue)}
            />
          )
        }

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
          default:
            return null
        }
      })}
    </div>
  )
}

