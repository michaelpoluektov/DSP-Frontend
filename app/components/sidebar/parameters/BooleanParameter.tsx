import { theme } from "@/styles/theme"
import BaseParameter, { BaseParameterProps } from "./BaseParameter"

interface BooleanParameterProps extends Omit<BaseParameterProps<boolean>, 'value' | 'onChange'> {
  value: boolean
  onChange: (value: boolean) => void
}

export default function BooleanParameter({ value, onChange, ...props }: BooleanParameterProps) {
  return (
    <BaseParameter {...props} value={value} onChange={onChange}>
      <div className="flex items-center">
        <button
          type="button"
          role="switch"
          aria-checked={value}
          onClick={() => onChange(!value)}
          className={`
            relative inline-flex h-6 w-11 flex-shrink-0 cursor-pointer rounded-full 
            transition-colors duration-200 ease-in-out
            ${value ? theme.colors.controls.boolean.active : theme.colors.controls.boolean.inactive}
            focus:outline-none focus:ring-2 focus:ring-offset-2 ${theme.colors.controls.boolean.focus}
          `}
        >
          <span className="sr-only">Toggle {props.name}</span>
          <span
            className={`
              pointer-events-none absolute top-[2px] left-[2px] inline-block h-5 w-5 
              transform rounded-full bg-white shadow ring-0 
              transition duration-200 ease-in-out
              ${value ? 'translate-x-5' : 'translate-x-0'}
            `}
          />
        </button>
      </div>
    </BaseParameter>
  )
} 