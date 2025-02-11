import BaseParameter, { BaseParameterProps } from "./BaseParameter"
import { BiquadFilterType } from "@/types/graph"
import { BiquadFilterControl } from "./BiquadFilterControl"

interface ParametricEqParameterProps extends Omit<BaseParameterProps<BiquadFilterType[]>, 'value' | 'onChange'> {
  value: BiquadFilterType[]
  onChange: (value: BiquadFilterType[]) => void
}

export default function ParametricEqParameter({ value, onChange, ...props }: ParametricEqParameterProps) {
  return (
    <BaseParameter {...props} value={value} onChange={onChange}>
      <div className="space-y-2">
        {value.map((filter, index) => (
          <BiquadFilterControl
            key={index}
            filter={filter}
            onChange={(updatedFilter) => {
              const newFilters = [...value]
              newFilters[index] = updatedFilter
              onChange(newFilters)
            }}
          />
        ))}
      </div>
    </BaseParameter>
  )
} 