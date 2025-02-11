import BaseParameter, { BaseParameterProps } from "./BaseParameter"
import { BiquadFilterType } from "@/types/graph"
import { BiquadFilterControl } from "./BiquadFilterControl"

interface BiquadParameterProps extends Omit<BaseParameterProps<BiquadFilterType>, 'value' | 'onChange'> {
  value: BiquadFilterType
  onChange: (value: BiquadFilterType) => void
}

export default function BiquadParameter({ value, onChange, ...props }: BiquadParameterProps) {
  return (
    <BaseParameter {...props} value={value} onChange={onChange}>
      <BiquadFilterControl filter={value} onChange={onChange} />
    </BaseParameter>
  )
} 