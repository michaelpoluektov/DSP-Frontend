import { theme } from "@/styles/theme"
import BaseParameter, { BaseParameterProps } from "./BaseParameter"

interface BooleanParameterProps extends Omit<BaseParameterProps<boolean>, 'value' | 'onChange'> {
  value: boolean
  onChange: (value: boolean) => void
}

export default function BooleanParameter({ value, onChange, ...props }: BooleanParameterProps) {
  const { title, description } = props.config
  return (
    <div className="mb-2">
      <div className="flex justify-between items-center">
        <label className={`${theme.colors.text.secondary} text-xs`}>
          {title || props.name}
          {description && (
            <span className="ml-1 text-gray-400 italic text-[10px]">({description})</span>
          )}
        </label>
        <button
          type="button"
          role="switch"
          aria-checked={value}
          onClick={() => onChange(!value)}
          className={`
            relative inline-flex h-4 w-11 flex-shrink-0 cursor-pointer rounded-full 
            transition-colors duration-200 ease-in-out
            ${value ? theme.colors.controls.boolean.active : theme.colors.controls.boolean.inactive}
            focus:outline-none focus:ring-2 focus:ring-offset-2 ${theme.colors.controls.boolean.focus}
          `}
        >
          <span className="sr-only">Toggle {props.name}</span>
          <span
            className={`
              pointer-events-none absolute top-[2px] left-[2px] inline-block h-3 w-3 
              transform rounded-full bg-white shadow ring-0 
              transition duration-200 ease-in-out
              ${value ? 'translate-x-[28px]' : 'translate-x-0'}
            `}
          />
        </button>
      </div>
    </div>
  )
} 