import { useEffect, useCallback, useState, useMemo } from "react"
import { theme } from "../styles/theme"
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
  Filler
} from "chart.js"
import { calculateEQResponse } from "../utils/eqResponse"
import type { ParametricEq } from "../types/graph"
import type { ParametricEqParameters } from "../utils/eqResponse"
import { debounce } from "../utils/debounce"

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

interface EQResponseGraphProps {
  node: ParametricEq
}

export default function EQResponseGraph({ node }: EQResponseGraphProps) {
  const [isResizing, setIsResizing] = useState(false);
  const [isCalculating, setIsCalculating] = useState(false);
  const [windowWidth, setWindowWidth] = useState(typeof window !== 'undefined' ? window.innerWidth : 0);
  const [response, setResponse] = useState<Awaited<ReturnType<typeof calculateEQResponse>> | null>(null);

  // Memoize the filters to prevent unnecessary recalculations
  const filters = useMemo(() => node.parameters?.filters, [
    // Only include the properties we care about from each filter
    node.parameters?.filters?.map(filter => {
      const base = { type: filter.type };
      switch (filter.type) {
        case "bypass":
          return base;
        case "lowpass":
        case "highpass":
        case "notch":
        case "allpass":
          return {
            ...base,
            filter_freq: filter.filter_freq,
            q_factor: filter.q_factor
          };
        case "bandpass":
        case "bandstop":
          return {
            ...base,
            filter_freq: filter.filter_freq,
            bw: filter.bw
          };
        case "peaking":
        case "lowshelf":
        case "highshelf":
        case "constant_q":
          return {
            ...base,
            filter_freq: filter.filter_freq,
            q_factor: filter.q_factor,
            boost_db: filter.boost_db
          };
        case "gain":
          return {
            ...base,
            gain_db: filter.gain_db
          };
        case "linkwitz":
          return {
            ...base,
            f0: filter.f0,
            fp: filter.fp,
            q0: filter.q0,
            qp: filter.qp
          };
        default:
          return base;
      }
    })
  ]);

  const debouncedCalculate = useCallback(
    debounce(async (filters: ParametricEqParameters['filters']) => {
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
    <div className="flex items-center justify-center h-full w-full bg-gray-50 rounded-lg">
      <div className="flex gap-2">
        <div className="w-2 h-2 bg-gray-300 rounded-full animate-pulse"></div>
        <div className="w-2 h-2 bg-gray-300 rounded-full animate-pulse delay-100"></div>
        <div className="w-2 h-2 bg-gray-300 rounded-full animate-pulse delay-200"></div>
      </div>
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

  const commonOptions: ChartOptions<'line'> = {
    responsive: true,
    maintainAspectRatio: false,
    plugins: {
      legend: {
        display: false
      },
      title: {
        display: false
      }
    },
    layout: {
      padding: 2
    }
  }

  const magnitudeOptions: ChartOptions<'line'> = {
    ...commonOptions,
    plugins: {
      legend: {
        display: false
      },
      title: {
        display: false
      }
    },
    scales: {
      x: {
        type: 'logarithmic',
        min: 20,
        max: 20000,
        position: 'bottom',
        title: {
          display: false
        },
        grid: {
          color: "#eee"
        },
        ticks: {
          color: "#666",
          padding: 0,
          font: {
            size: 10
          },
          maxRotation: 0,
          autoSkip: true,
          callback: function(value) {
            const freq = Number(value);
            if (freq === 20) return '20Hz';
            if (freq === 100) return '100Hz';
            if (freq === 1000) return '1kHz';
            if (freq === 10000) return '10kHz';
            if (freq === 20000) return '20kHz';
            return '';
          }
        }
      },
      y: {
        min: -24,
        max: 24,
        position: 'left',
        title: {
          display: false
        },
        grid: {
          color: "#eee",
          drawOnChartArea: true
        },
        ticks: {
          color: "#666",
          padding: 0,
          font: {
            size: 10
          },
          stepSize: 8,
          callback: function(value) {
            return value + 'dB';
          }
        }
      }
    }
  }

  const phaseOptions: ChartOptions<'line'> = {
    ...commonOptions,
    plugins: {
      legend: {
        display: false
      },
      title: {
        display: false
      }
    },
    scales: {
      x: {
        type: 'logarithmic',
        min: 20,
        max: 20000,
        position: 'bottom',
        title: {
          display: false
        },
        grid: {
          color: "#eee"
        },
        ticks: {
          color: "#666",
          padding: 0,
          font: {
            size: 10
          },
          maxRotation: 0,
          autoSkip: true,
          callback: function(value) {
            const freq = Number(value);
            if (freq === 20) return '20Hz';
            if (freq === 100) return '100Hz';
            if (freq === 1000) return '1kHz';
            if (freq === 10000) return '10kHz';
            if (freq === 20000) return '20kHz';
            return '';
          }
        }
      },
      y: {
        min: -Math.PI,
        max: Math.PI,
        position: 'left',
        title: {
          display: false
        },
        grid: {
          color: "#eee",
          drawOnChartArea: true
        },
        ticks: {
          color: "#666",
          padding: 0,
          font: {
            size: 10
          },
          callback: function(tickValue: number | string) {
            const value = Number(tickValue);
            if (value === -Math.PI) return '-π';
            if (value === -Math.PI/2) return '-π/2';
            if (value === 0) return '0';
            if (value === Math.PI/2) return 'π/2';
            if (value === Math.PI) return 'π';
            return '';
          },
          stepSize: Math.PI/2
        }
      }
    }
  }

  const magnitudeData = {
    datasets: [
      {
        label: "Magnitude",
        data: dataPoints,
        borderColor: "#00B6B0",
        backgroundColor: "rgba(0, 182, 176, 0.1)",
        borderWidth: 2,
        pointRadius: 0,
        fill: true,
        tension: 0.4
      }
    ]
  }

  const phaseData = {
    datasets: [
      {
        label: "Phase",
        data: phasePoints,
        borderColor: "#FF6B6B",
        backgroundColor: "rgba(255, 107, 107, 0.1)",
        borderWidth: 2,
        pointRadius: 0,
        fill: true,
        tension: 0.4
      }
    ]
  }

  return (
    <div className="flex gap-4 h-full">
      <div className="flex-1 h-full relative">
        <div className="absolute top-0 right-0 z-10 text-xs text-gray-500 font-semibold bg-white px-1.5 py-0.5 border border-gray-300">
          Magnitude Response
          {isCalculating && !isResizing && (
            <span className="ml-2 inline-flex gap-1">
              <span className="w-1 h-1 bg-gray-300 rounded-full animate-pulse"></span>
              <span className="w-1 h-1 bg-gray-300 rounded-full animate-pulse delay-100"></span>
              <span className="w-1 h-1 bg-gray-300 rounded-full animate-pulse delay-200"></span>
            </span>
          )}
        </div>
        {isResizing ? (
          <LoadingPlaceholder />
        ) : (
          <Line data={magnitudeData} options={magnitudeOptions} key={windowWidth} />
        )}
      </div>
      <div className="flex-1 h-full relative">
        <div className="absolute top-0 right-0 z-10 text-xs text-gray-500 font-semibold bg-white px-1.5 py-0.5 border border-gray-300">
          Phase Response
          {isCalculating && !isResizing && (
            <span className="ml-2 inline-flex gap-1">
              <span className="w-1 h-1 bg-gray-300 rounded-full animate-pulse"></span>
              <span className="w-1 h-1 bg-gray-300 rounded-full animate-pulse delay-100"></span>
              <span className="w-1 h-1 bg-gray-300 rounded-full animate-pulse delay-200"></span>
            </span>
          )}
        </div>
        {isResizing ? (
          <LoadingPlaceholder />
        ) : (
          <Line data={phaseData} options={phaseOptions} key={windowWidth} />
        )}
      </div>
    </div>
  )
} 