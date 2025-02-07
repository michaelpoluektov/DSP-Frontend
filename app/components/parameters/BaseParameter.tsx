import { theme } from "../../styles/theme"
import { ParameterConfig } from "../../utils/parameterTypes"

export interface BaseParameterProps<T extends number | boolean> {
  name: string
  value: T
  config: ParameterConfig
  onChange: (value: T) => void
}

export default function BaseParameter<T extends number | boolean>({ 
  name, 
  value, 
  config, 
  onChange,
  children 
}: BaseParameterProps<T> & { children?: React.ReactNode }) {
  const { title, description } = config

  return (
    <div className="mb-2">
      <div className="flex justify-between items-center mb-1">
        <label className={`${theme.colors.text.secondary} text-xs`}>
          {title || name}
          {description && (
            <span className="ml-1 text-gray-400 italic text-[10px]">({description})</span>
          )}
        </label>
      </div>
      {children}
    </div>
  )
} 