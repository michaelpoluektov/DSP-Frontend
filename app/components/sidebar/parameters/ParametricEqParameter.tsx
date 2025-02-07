import { useEffect, useState } from "react"
import { theme } from "@/styles/theme"
import BaseParameter, { BaseParameterProps } from "./BaseParameter"
import { Slider } from "@/components/ui/slider"
import { BiquadFilterType } from "@/types/graph"
import { Plus, Minus } from "lucide-react"

interface ParametricEqParameterProps extends Omit<BaseParameterProps<BiquadFilterType[]>, 'value' | 'onChange'> {
  value: BiquadFilterType[]
  onChange: (value: BiquadFilterType[]) => void
}

const filterTypes = [
  "allpass",
  "bandpass",
  "bandstop",
  "bypass",
  "constant_q",
  "gain",
  "highpass",
  "highshelf",
  "linkwitz",
  "lowpass",
  "lowshelf",
  "notch",
  "peaking",
] as const

const defaultFilter: BiquadFilterType = { type: "bypass" }

interface ParameterSliderProps {
  label: string
  value: number
  min: number
  max: number
  step: number
  onChange: (value: number) => void
  unit?: string
}

const ParameterSlider = ({ label, value, min, max, step, onChange, unit }: ParameterSliderProps) => (
  <div className="mb-2">
    <div className="flex justify-between items-center mb-1">
      <span className="text-xs text-gray-400">{label}</span>
      <span className="text-xs text-gray-400">{value}{unit}</span>
    </div>
    <Slider
      min={min}
      max={max}
      step={step}
      value={[value]}
      onValueChange={(values) => onChange(values[0])}
      className="w-full"
    />
  </div>
)

const FilterHeader = ({ 
  index, 
  type, 
  onChange 
}: { 
  index: number
  type: typeof filterTypes[number]
  onChange: (type: typeof filterTypes[number]) => void
}) => {
  const isBypass = type === "bypass"

  if (isBypass) {
    return (
      <div className="flex items-center justify-between">
        <span className={`${theme.colors.text.secondary} text-xs`}>Filter {index + 1}</span>
        <button
          onClick={() => onChange("peaking")}
          className={`${theme.colors.button.primary} ${theme.colors.text.primary} ${theme.borderWidth} ${theme.colors.border} ${theme.rounded} p-0.5 hover:bg-gray-100 transition-colors focus:outline-none focus:ring-2 focus:ring-[#00B6B0]/30 focus:border-[#00B6B0]`}
        >
          <Plus size={16} />
        </button>
      </div>
    )
  }

  return (
    <div className="flex items-center justify-between">
      <span className={`${theme.colors.text.secondary} text-xs`}>Filter {index + 1}</span>
      <div className="flex items-center gap-1">
        <select
          value={type}
          onChange={(e) => onChange(e.target.value as typeof filterTypes[number])}
          className={`${theme.colors.primary} ${theme.colors.text.primary} ${theme.borderWidth} ${theme.colors.border} ${theme.rounded} px-1.5 py-0.5 text-xs w-[80px] text-ellipsis focus:outline-none focus:ring-2 focus:ring-[#00B6B0]/30 focus:border-[#00B6B0]`}
          title={type.charAt(0).toUpperCase() + type.slice(1)}
        >
          {filterTypes.filter(t => t !== "bypass").map((type) => (
            <option key={type} value={type} title={type.charAt(0).toUpperCase() + type.slice(1)}>
              {type.charAt(0).toUpperCase() + type.slice(1)}
            </option>
          ))}
        </select>
        <button
          onClick={() => onChange("bypass")}
          className={`${theme.colors.button.primary} ${theme.colors.text.primary} ${theme.borderWidth} ${theme.colors.border} ${theme.rounded} p-0.5 hover:bg-gray-100 transition-colors focus:outline-none focus:ring-2 focus:ring-[#00B6B0]/30 focus:border-[#00B6B0]`}
        >
          <Minus size={16} />
        </button>
      </div>
    </div>
  )
}

const FilterParameters = ({ 
  filter, 
  onChange,
  index
}: { 
  filter: BiquadFilterType, 
  onChange: (filter: BiquadFilterType) => void,
  index: number
}) => {
  const getDefaultFilterParams = (type: typeof filterTypes[number]): BiquadFilterType => {
    switch (type) {
      case "allpass":
      case "highpass":
      case "lowpass":
      case "notch":
        return { type, filter_freq: 1000, q_factor: 0.707 }
      case "bandpass":
      case "bandstop":
        return { type, filter_freq: 1000, bw: 1 }
      case "constant_q":
      case "highshelf":
      case "lowshelf":
      case "peaking":
        return { type, filter_freq: 1000, q_factor: 0.707, boost_db: 0 }
      case "linkwitz":
        return { type, f0: 1000, q0: 0.707, fp: 2000, qp: 0.707 }
      case "gain":
        return { type, gain_db: 0 }
      case "bypass":
        return { type: "bypass" }
    }
  }

  const handleTypeChange = (type: typeof filterTypes[number]) => {
    onChange(getDefaultFilterParams(type))
  }

  const renderParameters = () => {
    switch (filter.type) {
      case "allpass":
      case "highpass":
      case "lowpass":
      case "notch":
        return (
          <>
            <ParameterSlider
              label="Frequency"
              value={filter.filter_freq}
              min={20}
              max={20000}
              step={1}
              onChange={(value) => onChange({ ...filter, filter_freq: value })}
              unit="Hz"
            />
            <ParameterSlider
              label="Q Factor"
              value={filter.q_factor}
              min={0.1}
              max={10}
              step={0.1}
              onChange={(value) => onChange({ ...filter, q_factor: value })}
            />
          </>
        )
      case "bandpass":
      case "bandstop":
        return (
          <>
            <ParameterSlider
              label="Frequency"
              value={filter.filter_freq}
              min={20}
              max={20000}
              step={1}
              onChange={(value) => onChange({ ...filter, filter_freq: value })}
              unit="Hz"
            />
            <ParameterSlider
              label="Bandwidth"
              value={filter.bw}
              min={0.1}
              max={4}
              step={0.1}
              onChange={(value) => onChange({ ...filter, bw: value })}
            />
          </>
        )
      case "constant_q":
      case "highshelf":
      case "lowshelf":
      case "peaking":
        return (
          <>
            <ParameterSlider
              label="Frequency"
              value={filter.filter_freq}
              min={20}
              max={20000}
              step={1}
              onChange={(value) => onChange({ ...filter, filter_freq: value })}
              unit="Hz"
            />
            <ParameterSlider
              label="Q Factor"
              value={filter.q_factor}
              min={0.1}
              max={10}
              step={0.1}
              onChange={(value) => onChange({ ...filter, q_factor: value })}
            />
            <ParameterSlider
              label="Gain"
              value={filter.boost_db}
              min={-24}
              max={24}
              step={0.1}
              onChange={(value) => onChange({ ...filter, boost_db: value })}
              unit="dB"
            />
          </>
        )
      case "linkwitz":
        return (
          <>
            <ParameterSlider
              label="F0"
              value={filter.f0}
              min={20}
              max={20000}
              step={1}
              onChange={(value) => onChange({ ...filter, f0: value })}
              unit="Hz"
            />
            <ParameterSlider
              label="Q0"
              value={filter.q0}
              min={0.1}
              max={10}
              step={0.1}
              onChange={(value) => onChange({ ...filter, q0: value })}
            />
            <ParameterSlider
              label="Fp"
              value={filter.fp}
              min={20}
              max={20000}
              step={1}
              onChange={(value) => onChange({ ...filter, fp: value })}
              unit="Hz"
            />
            <ParameterSlider
              label="Qp"
              value={filter.qp}
              min={0.1}
              max={10}
              step={0.1}
              onChange={(value) => onChange({ ...filter, qp: value })}
            />
          </>
        )
      case "gain":
        return (
          <ParameterSlider
            label="Gain"
            value={filter.gain_db}
            min={-24}
            max={24}
            step={0.1}
            onChange={(value) => onChange({ ...filter, gain_db: value })}
            unit="dB"
          />
        )
      case "bypass":
        return null
    }
  }

  const parameters = renderParameters()
  const isBypass = filter.type === "bypass"

  return (
    <div className={`${theme.colors.primary} ${theme.borderWidth} ${theme.colors.border} ${theme.rounded} ${isBypass ? 'py-1.5' : 'py-2'} px-2 mb-1.5`}>
      <FilterHeader index={index} type={filter.type} onChange={handleTypeChange} />
      {parameters && <div className="mt-2">{parameters}</div>}
    </div>
  )
}

export default function ParametricEqParameter({ value, onChange, ...props }: ParametricEqParameterProps) {
  const handleFilterChange = (index: number, newFilter: BiquadFilterType) => {
    const newFilters = [...value]
    newFilters[index] = newFilter
    onChange(newFilters)
  }

  return (
    <BaseParameter {...props} value={value} onChange={onChange}>
      <div className="max-h-[60vh] overflow-y-auto hover:scrollbar-visible scrollbar-hidden">
        {value.map((filter, index) => (
          <FilterParameters
            key={index}
            index={index}
            filter={filter}
            onChange={(newFilter) => handleFilterChange(index, newFilter)}
          />
        ))}
      </div>
    </BaseParameter>
  )
} 