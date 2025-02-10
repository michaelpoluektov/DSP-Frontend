import { theme } from "../styles/theme"

export async function drawWaveform(audioBuffer: AudioBuffer, canvas: HTMLCanvasElement, color: string = theme.colors.xmos.teal) {
  const ctx = canvas.getContext('2d')
  if (!ctx) return

  const dpr = window.devicePixelRatio || 1
  const rect = canvas.getBoundingClientRect()
  
  canvas.width = rect.width * dpr
  canvas.height = rect.height * dpr
  ctx.scale(dpr, dpr)

  ctx.fillStyle = 'rgb(243, 244, 246)' // gray-100
  ctx.fillRect(0, 0, rect.width, rect.height)
  
  // Draw border
  ctx.strokeStyle = theme.colors.xmos.lightTeal
  ctx.lineWidth = 2
  ctx.strokeRect(0, 0, rect.width, rect.height)

  const data = audioBuffer.getChannelData(0)
  const step = Math.ceil(data.length / rect.width)
  const amp = (rect.height - 8) / 2 // Slightly reduced amplitude for gradient space
  const centerY = rect.height / 2

  // Create gradient
  const gradient = ctx.createLinearGradient(0, 4, 0, rect.height - 4)
  gradient.addColorStop(0, color)
  gradient.addColorStop(0.5, theme.colors.xmos.lightTeal)
  gradient.addColorStop(1, color)

  // Collect points for the waveform
  const points: { x: number; y: number; magnitude: number }[] = []
  
  for (let i = 0; i < rect.width; i++) {
    let min = 1.0
    let max = -1.0
    let sum = 0
    let count = 0
    
    for (let j = 0; j < step; j++) {
      const datum = data[(i * step) + j]
      if (datum < min) min = datum
      if (datum > max) max = datum
      sum += Math.abs(datum)
      count++
    }
    
    const magnitude = sum / count // Average magnitude for this segment
    const x = i
    const y = centerY + ((max + min) / 2) * amp // Use average of min/max for smoother line

    points.push({ x, y, magnitude })
  }

  // Draw the filled waveform with gradient
  ctx.fillStyle = gradient
  ctx.beginPath()
  ctx.moveTo(0, centerY)

  // Draw top curve for fill
  for (let i = 0; i < points.length; i++) {
    const point = points[i]
    const prevPoint = points[i - 1] || point
    const magnitude = Math.min(1, point.magnitude * 2)
    const y = centerY - (magnitude * amp)
    
    if (i === 0) {
      ctx.moveTo(point.x, y)
    } else {
      const cpX = prevPoint.x + (point.x - prevPoint.x) / 2
      ctx.quadraticCurveTo(cpX, centerY - (prevPoint.magnitude * 2 * amp), point.x, y)
    }
  }

  // Draw bottom curve for fill
  for (let i = points.length - 1; i >= 0; i--) {
    const point = points[i]
    const prevPoint = points[i + 1] || point
    const magnitude = Math.min(1, point.magnitude * 2)
    const y = centerY + (magnitude * amp)
    
    if (i === points.length - 1) {
      ctx.lineTo(point.x, y)
    } else {
      const cpX = prevPoint.x + (point.x - prevPoint.x) / 2
      ctx.quadraticCurveTo(cpX, centerY + (prevPoint.magnitude * 2 * amp), point.x, y)
    }
  }

  ctx.closePath()
  ctx.fill()

  // Draw the outline strokes
  ctx.strokeStyle = color
  ctx.lineWidth = 1

  // Top outline
  ctx.beginPath()
  for (let i = 0; i < points.length; i++) {
    const point = points[i]
    const prevPoint = points[i - 1] || point
    const magnitude = Math.min(1, point.magnitude * 2)
    const y = centerY - (magnitude * amp)
    
    if (i === 0) {
      ctx.moveTo(point.x, y)
    } else {
      const cpX = prevPoint.x + (point.x - prevPoint.x) / 2
      ctx.quadraticCurveTo(cpX, centerY - (prevPoint.magnitude * 2 * amp), point.x, y)
    }
  }
  ctx.stroke()

  // Bottom outline
  ctx.beginPath()
  for (let i = points.length - 1; i >= 0; i--) {
    const point = points[i]
    const prevPoint = points[i + 1] || point
    const magnitude = Math.min(1, point.magnitude * 2)
    const y = centerY + (magnitude * amp)
    
    if (i === points.length - 1) {
      ctx.moveTo(point.x, y)
    } else {
      const cpX = prevPoint.x + (point.x - prevPoint.x) / 2
      ctx.quadraticCurveTo(cpX, centerY + (prevPoint.magnitude * 2 * amp), point.x, y)
    }
  }
  ctx.stroke()
}

export function drawLiveWaveform(
  canvas: HTMLCanvasElement, 
  analyzer: AnalyserNode, 
  color: string = theme.colors.xmos.teal
) {
  const ctx = canvas.getContext('2d')
  if (!ctx) return

  const rect = canvas.getBoundingClientRect()
  const dataArray = new Uint8Array(analyzer.frequencyBinCount)
  
  ctx.fillStyle = 'rgb(243, 244, 246)' // gray-100
  ctx.fillRect(0, 0, rect.width, rect.height)
  
  // Draw border
  ctx.strokeStyle = theme.colors.xmos.lightTeal
  ctx.lineWidth = 2
  ctx.strokeRect(0, 0, rect.width, rect.height)
  
  ctx.lineWidth = 1.5
  ctx.strokeStyle = color
  ctx.beginPath()
  
  analyzer.getByteTimeDomainData(dataArray)
  const sliceWidth = rect.width / dataArray.length
  const centerY = rect.height / 2
  let x = 0
  
  for (let i = 0; i < dataArray.length; i++) {
    const v = (dataArray[i] / 128.0) - 1
    const y = centerY + (v * centerY)
    
    if (i === 0) {
      ctx.moveTo(x, y)
    } else {
      const prevX = x - sliceWidth
      const prevY = centerY + (((dataArray[i - 1] / 128.0) - 1) * centerY)
      const cpX = prevX + (x - prevX) / 2
      ctx.quadraticCurveTo(cpX, prevY, x, y)
    }
    
    x += sliceWidth
  }
  
  ctx.stroke()
}

export function drawEmptyWaveform(canvas: HTMLCanvasElement) {
  const ctx = canvas.getContext('2d')
  if (!ctx) return

  const dpr = window.devicePixelRatio || 1
  const rect = canvas.getBoundingClientRect()
  
  canvas.width = rect.width * dpr
  canvas.height = rect.height * dpr
  ctx.scale(dpr, dpr)
  
  // Draw baseline state
  ctx.fillStyle = 'rgb(243, 244, 246)' // gray-100
  ctx.fillRect(0, 0, rect.width, rect.height)
  
  // Draw border
  ctx.strokeStyle = theme.colors.xmos.lightTeal
  ctx.lineWidth = 2
  ctx.strokeRect(0, 0, rect.width, rect.height)
  
  // Draw center line
  ctx.lineWidth = 1.5
  ctx.strokeStyle = theme.colors.xmos.teal
  ctx.beginPath()
  ctx.moveTo(0, rect.height / 2)
  ctx.lineTo(rect.width, rect.height / 2)
  ctx.stroke()
} 