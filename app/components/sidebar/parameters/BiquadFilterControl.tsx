import { theme } from "@/styles/theme"
import { BiquadFilterType } from "@/types/graph"
import { Slider } from "@/components/ui/slider"

const filterTypes = [
  "allpass", "bandpass", "bandstop", "bypass", "constant_q", "gain",
  "highpass", "highshelf", "linkwitz", "lowpass", "lowshelf", "notch", "peaking",
] as const

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
      min={min} max={max} step={step}
      value={[value]}
      onValueChange={(values) => onChange(values[0])}
      className="w-full"
    />
  </div>
)

interface BiquadFilterControlProps {
  filter: BiquadFilterType
  onChange: (filter: BiquadFilterType) => void
  showTypeSelector?: boolean
}

export function BiquadFilterControl({ filter, onChange, showTypeSelector = true }: BiquadFilterControlProps) {
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
              max={10}
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
              label="Boost"
              value={filter.boost_db}
              min={-20}
              max={20}
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
              label="Frequency"
              value={filter.f0}
              min={20}
              max={20000}
              step={1}
              onChange={(value) => onChange({ ...filter, f0: value })}
              unit="Hz"
            />
            <ParameterSlider
              label="Q Factor"
              value={filter.q0}
              min={0.1}
              max={10}
              step={0.1}
              onChange={(value) => onChange({ ...filter, q0: value })}
            />
            <ParameterSlider
              label="Peak Frequency"
              value={filter.fp}
              min={20}
              max={20000}
              step={1}
              onChange={(value) => onChange({ ...filter, fp: value })}
              unit="Hz"
            />
            <ParameterSlider
              label="Peak Q Factor"
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
          <>
            <ParameterSlider
              label="Gain"
              value={filter.gain_db}
              min={-20}
              max={20}
              step={0.1}
              onChange={(value) => onChange({ ...filter, gain_db: value })}
              unit="dB"
            />
          </>
        )
      case "bypass":
        return (
          <>
            {/* No parameters for bypass */}
          </>
        )
    }
  }

  const parameters = renderParameters()

  return (
    <div className={`${theme.colors.primary} ${theme.borderWidth} ${theme.colors.border} ${theme.rounded} py-2 px-2`}>
      {showTypeSelector && (
        <div className="flex items-center justify-between">
          <span className={`${theme.colors.text.secondary} text-xs`}>Filter Type</span>
          <select
            value={filter.type}
            onChange={(e) => handleTypeChange(e.target.value as typeof filterTypes[number])}
            className={`${theme.colors.primary} ${theme.colors.text.primary} ${theme.borderWidth} ${theme.colors.border} ${theme.rounded} px-1.5 py-0.5 text-xs w-[80px] text-ellipsis focus:outline-none focus:ring-2 focus:ring-[#00B6B0]/30 focus:border-[#00B6B0]`}
            title={filter.type.charAt(0).toUpperCase() + filter.type.slice(1)}
          >
            {filterTypes.map((type) => (
              <option key={type} value={type} title={type.charAt(0).toUpperCase() + type.slice(1)}>
                {type.charAt(0).toUpperCase() + type.slice(1)}
              </option>
            ))}
          </select>
        </div>
      )}
      {parameters}
    </div>
  )
} 