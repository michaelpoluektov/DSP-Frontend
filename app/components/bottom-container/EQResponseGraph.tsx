import React, { useEffect, useCallback, useState, useMemo } from "react"
import { Line } from "react-chartjs-2"
import {
  Chart as ChartJS,
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  Title,
  Tooltip,
  Legend,
  LogarithmicScale,
  ChartOptions,
  Filler,
  Scale,
  CoreScaleOptions
} from "chart.js"
import { calculateEQResponse } from "@/utils/eqResponse"
import type { ParametricEq, BiquadFilterType, ParametricEqParameters } from "@/types/graph"
import { debounce } from "@/utils/debounce"
import { commonStyles } from "@/styles/common"

ChartJS.register(
  CategoryScale,
  LinearScale,
  LogarithmicScale,
  PointElement,
  LineElement,
  Title,
  Tooltip,
  Legend,
  Filler
)

// Chart configurations
const chartCommonOptions: ChartOptions<'line'> = {
  responsive: true,
  maintainAspectRatio: false,
  plugins: {
    legend: { display: false },
    title: { display: false }
  },
  layout: { padding: 2 }
}

const createAxisConfig = (isFrequency: boolean) => ({
  type: 'logarithmic' as const,
  min: isFrequency ? 20 : undefined,
  max: isFrequency ? 20000 : undefined,
  position: 'bottom' as const,
  title: { display: false },
  grid: { color: "#eee" },
  ticks: {
    color: "#666",
    padding: 0,
    font: { size: 10 },
    maxRotation: 0,
    autoSkip: true,
    callback(this: Scale<CoreScaleOptions>, value: number | string) {
      if (!isFrequency) return value;
      const freq = Number(value);
      if (freq === 20) return '20Hz';
      if (freq === 100) return '100Hz';
      if (freq === 1000) return '1kHz';
      if (freq === 10000) return '10kHz';
      if (freq === 20000) return '20kHz';
      return '';
    }
  }
})

const createChartData = (points: { x: number, y: number }[], color: string) => ({
  datasets: [{
    data: points,
    borderColor: color,
    backgroundColor: `${color}1A`, // 10% opacity
    borderWidth: 2,
    pointRadius: 0,
    fill: true,
    tension: 0.4
  }]
})

const createChartOptions = (yAxisConfig: {
  min: number;
  max: number;
  ticks: {
    stepSize?: number;
    callback(this: Scale<CoreScaleOptions>, value: number | string): string;
  };
}): ChartOptions<'line'> => ({
  ...chartCommonOptions,
  scales: {
    x: createAxisConfig(true),
    y: {
      position: 'left',
      title: { display: false },
      grid: {
        color: "#eee",
        drawOnChartArea: true
      },
      ticks: {
        color: "#666",
        padding: 0,
        font: { size: 10 },
        maxTicksLimit: 7,
        align: 'end',
        ...yAxisConfig.ticks
      },
      min: yAxisConfig.min,
      max: yAxisConfig.max,
      afterFit: (scale) => {
        // Force a minimum width for the y-axis to ensure alignment
        scale.width = 50;
      }
    }
  }
})

// Component interfaces
interface EQResponseGraphProps {
  node: ParametricEq | { 
    parameters?: { 
      filter_type?: BiquadFilterType 
    };
    op_type: "Biquad";
  }
}

export default function EQResponseGraph({ node }: EQResponseGraphProps) {
  const [isResizing, setIsResizing] = useState(false);
  const [isCalculating, setIsCalculating] = useState(false);
  const [windowWidth, setWindowWidth] = useState(typeof window !== 'undefined' ? window.innerWidth : 0);
  const [response, setResponse] = useState<Awaited<ReturnType<typeof calculateEQResponse>> | null>(null);

  // Create an array of 8 bypass filters
  const bypassFilters: [BiquadFilterType, ...BiquadFilterType[]] = [
    { type: "bypass" },
    { type: "bypass" },
    { type: "bypass" },
    { type: "bypass" },
    { type: "bypass" },
    { type: "bypass" },
    { type: "bypass" },
    { type: "bypass" }
  ];

  // Memoize the filters to prevent unnecessary recalculations
  const filters = useMemo(() => {
    if (node.op_type === "ParametricEq") {
      return node.parameters?.filters;
    } else if (node.parameters?.filter_type) {
      // For Biquad nodes, use the filter in the first slot and bypass the rest
      return [
        node.parameters.filter_type,
        ...bypassFilters.slice(1)
      ] as ParametricEqParameters["filters"];
    }
    return bypassFilters as ParametricEqParameters["filters"];
  }, [node]);

  const debouncedCalculate = useCallback(
    debounce(async (filters: ParametricEqParameters["filters"]) => {
      try {
        setIsCalculating(true);
        const newResponse = await calculateEQResponse({ filters });
        setResponse(newResponse);
      } catch (error) {
        console.error('Error calculating EQ response:', error);
      } finally {
        setIsCalculating(false);
      }
    }, 100),
    []
  );

  useEffect(() => {
    if (!filters) return;
    debouncedCalculate(filters);
  }, [filters, debouncedCalculate]);

  useEffect(() => {
    if (typeof window === 'undefined') return;

    const handleResize = () => {
      setIsResizing(true);
    };

    const handleResizeEnd = debounce(() => {
      setWindowWidth(window.innerWidth);
      setIsResizing(false);
    }, 250);

    window.addEventListener('resize', handleResize);
    window.addEventListener('resize', handleResizeEnd);

    return () => {
      window.removeEventListener('resize', handleResize);
      window.removeEventListener('resize', handleResizeEnd);
    };
  }, []);

  if (!response) return null;

  const LoadingPlaceholder = () => (
    <div className={`flex items-center justify-center h-full w-full ${commonStyles.container.secondary}`}>
      <div className="flex gap-2">
        <div className="w-2 h-2 bg-gray-300 rounded-full animate-pulse"></div>
        <div className="w-2 h-2 bg-gray-300 rounded-full animate-pulse delay-100"></div>
        <div className="w-2 h-2 bg-gray-300 rounded-full animate-pulse delay-200"></div>
      </div>
    </div>
  );

  const ResponseLabel = ({ title, isCalculating, isResizing }: { title: string, isCalculating: boolean, isResizing: boolean }) => (
    <div className={`absolute top-0 right-0 z-10 text-xs ${commonStyles.text.secondary} bg-white px-1.5 py-0.5 ${commonStyles.input.base}`}>
      {title}
      {isCalculating && !isResizing && (
        <span className="ml-2 inline-flex gap-1">
          <span className="w-1 h-1 bg-gray-300 rounded-full animate-pulse"></span>
          <span className="w-1 h-1 bg-gray-300 rounded-full animate-pulse delay-100"></span>
          <span className="w-1 h-1 bg-gray-300 rounded-full animate-pulse delay-200"></span>
        </span>
      )}
    </div>
  );

  // Create data points for the chart
  const dataPoints = response.frequencies.map((freq, i) => ({
    x: freq,
    y: response.magnitudes[i]
  }))

  const phasePoints = response.frequencies.map((freq, i) => ({
    x: freq,
    y: response.phases[i]
  }))

  const magnitudeOptions = createChartOptions({
    min: -24,
    max: 24,
    ticks: {
      stepSize: 8,
      callback(this: Scale<CoreScaleOptions>, value: number | string) {
        // Ensure consistent width by padding with spaces
        return `${value}dB   `;
      }
    }
  })

  const phaseOptions = createChartOptions({
    min: -Math.PI,
    max: Math.PI,
    ticks: {
      stepSize: Math.PI/2,
      callback(this: Scale<CoreScaleOptions>, value: number | string) {
        const v = Number(value);
        // Ensure consistent width by padding with spaces
        if (v === -Math.PI) return '-π    ';
        if (v === -Math.PI/2) return '-π/2  ';
        if (v === 0) return '0     ';
        if (v === Math.PI/2) return 'π/2   ';
        if (v === Math.PI) return 'π     ';
        return '';
      }
    }
  })

  const magnitudeData = createChartData(dataPoints, "#00B6B0")
  const phaseData = createChartData(phasePoints, "#00E6DF")

  return (
    <div className="flex flex-col lg:flex-row gap-0 lg:gap-4 h-full">
      <div className="h-[calc(50%-0.05rem)] lg:h-full lg:flex-1 relative">
        <ResponseLabel title="Magnitude Response" isCalculating={isCalculating} isResizing={isResizing} />
        {isResizing ? (
          <LoadingPlaceholder />
        ) : (
          <Line data={magnitudeData} options={magnitudeOptions} key={windowWidth} />
        )}
      </div>
      <div className="h-[calc(50%-0.0rem)] lg:h-full lg:flex-1 relative">
        <ResponseLabel title="Phase Response" isCalculating={isCalculating} isResizing={isResizing} />
        {isResizing ? (
          <LoadingPlaceholder />
        ) : (
          <Line data={phaseData} options={phaseOptions} key={windowWidth} />
        )}
      </div>
    </div>
  )
} 