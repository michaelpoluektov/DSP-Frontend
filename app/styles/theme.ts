export const theme = {
  colors: {
    xmos: {
      teal: "#00B6B0",
      lightTeal: "#E5F7F6",  // Light version of the teal color for backgrounds/borders
      purple: "#6366F1",     // For output visualizations
      lightPurple: "#EEF2FF" // Light version of purple
    },
    background: "bg-white",
    primary: "bg-white",
    secondary: "bg-gray-50",
    tertiary: "bg-gray-50",
    text: {
      primary: "text-gray-900",
      secondary: "text-gray-600",
      tertiary: "text-gray-500",
    },
    button: {
      primary: "bg-gray-50 hover:bg-gray-100",
      secondary: "bg-white hover:bg-gray-50",
    },
    border: "border-[#E5F7F6]",  // Using XMOS light teal
    controls: {
      boolean: {
        active: "#00B6B0",  // Using XMOS teal
        inactive: "bg-gray-200",
        focus: "ring-[#00B6B0]/30",
      },
      slider: {
        track: {
          active: "#00B6B0",
          inactive: "bg-white",
        },
        thumb: "accent-[#00B6B0]"
      }
    }
  },
  fonts: {
    body: "font-sans",
    heading: "font-sans font-semibold",
    title: "text-xl font-bold tracking-tight",
    subtitle: "text-l font-sans",
  },
  spacing: {
    sm: "p-1",
    md: "p-1",
    lg: "p-1",
  },
  rounded: "rounded-lg",
  shadow: "shadow-md",
  borderWidth: "border",
  emphasis: {
    background: "bg-gray-50",
    padding: "px-2 py-1",
  },
  textEffect: {
    shadow: "drop-shadow-md",
    outline: "text-gray-900 text-shadow-sm",
  },
}

