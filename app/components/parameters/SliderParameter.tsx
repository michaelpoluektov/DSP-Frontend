import { useEffect, useState } from "react"
import { theme } from "../../styles/theme"
import BaseParameter, { BaseParameterProps } from "./BaseParameter"
import { Slider } from "../ui/slider"

interface SliderParameterProps extends Omit<BaseParameterProps<number>, 'value' | 'onChange'> {
  value: number
  onChange: (value: number) => void
}

export default function SliderParameter({ value, onChange, ...props }: SliderParameterProps) {
  const { min = 0, max = 1, step = 0.01, useLogScale = false } = props.config
  const [inputValue, setInputValue] = useState<string>(value.toString())
  const [previousValue, setPreviousValue] = useState<number>(value)

  // Convert between linear and logarithmic scales
  const toLogScale = (value: number) => {
    if (!useLogScale) return value
    return Math.log(value) / Math.log(max) * max
  }

  const fromLogScale = (value: number) => {
    if (!useLogScale) return value
    return Math.exp(value / max * Math.log(max))
  }

  // Update input value when prop value changes
  useEffect(() => {
    setInputValue(value.toString())
    setPreviousValue(value)
  }, [value])

  const handleSliderChange = (newValue: number[]) => {
    const scaledValue = fromLogScale(newValue[0])
    onChange(scaledValue)
  }

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const newInputValue = e.target.value
    setInputValue(newInputValue)

    if (newInputValue === '') {
      return
    }

    const newValue = parseFloat(newInputValue)
    if (!isNaN(newValue) && isFinite(newValue)) {
      const clampedValue = Math.min(Math.max(newValue, min), max)
      onChange(clampedValue)
    }
  }

  const handleInputBlur = () => {
    if (inputValue === '' || isNaN(parseFloat(inputValue))) {
      setInputValue(previousValue.toString())
    }
  }

  return (
    <BaseParameter {...props} value={value} onChange={onChange}>
      <div className="flex gap-2 items-center w-full">
        <Slider
          min={useLogScale ? toLogScale(min) : min}
          max={useLogScale ? toLogScale(max) : max}
          step={step}
          value={[useLogScale ? toLogScale(value) : value]}
          onValueChange={handleSliderChange}
          className="flex-1"
        />
        <input
          type="text"
          value={inputValue}
          onChange={handleInputChange}
          onBlur={handleInputBlur}
          className={`w-6 min-w-[4rem] ${theme.colors.primary} ${theme.colors.text.primary} ${theme.borderWidth} ${theme.colors.border} ${theme.rounded} px-1 py-0.5 text-xs text-right`}
        />
      </div>
    </BaseParameter>
  )
} 