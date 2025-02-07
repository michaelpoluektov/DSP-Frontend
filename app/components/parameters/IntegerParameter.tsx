import { useEffect, useState } from "react"
import { theme } from "../../styles/theme"
import BaseParameter, { BaseParameterProps } from "./BaseParameter"

interface IntegerParameterProps extends Omit<BaseParameterProps<number>, 'value' | 'onChange'> {
  value: number
  onChange: (value: number) => void
}

export default function IntegerParameter({ value, onChange, ...props }: IntegerParameterProps) {
  const { min = 0, max = 1 } = props.config
  const [inputValue, setInputValue] = useState<string>(value.toString())
  const [previousValue, setPreviousValue] = useState<number>(value)

  // Update input value when prop value changes
  useEffect(() => {
    setInputValue(value.toString())
    setPreviousValue(value)
  }, [value])

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const newInputValue = e.target.value
    setInputValue(newInputValue)

    if (newInputValue === '') {
      return
    }

    const newValue = parseInt(newInputValue, 10)
    if (!isNaN(newValue) && isFinite(newValue)) {
      // Clamp the value to min/max
      const clampedValue = Math.min(Math.max(newValue, min), max)
      onChange(clampedValue)
    }
  }

  const handleInputBlur = () => {
    if (inputValue === '' || isNaN(parseInt(inputValue, 10))) {
      setInputValue(previousValue.toString())
    }
  }

  return (
    <BaseParameter {...props} value={value} onChange={onChange}>
      <input
        type="text"
        value={inputValue}
        onChange={handleInputChange}
        onBlur={handleInputBlur}
        className={`w-full ${theme.colors.primary} ${theme.colors.text.primary} ${theme.borderWidth} ${theme.colors.border} ${theme.rounded} px-2 py-1 text-xs`}
      />
    </BaseParameter>
  )
} 