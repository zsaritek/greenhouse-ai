export function formatTimestamp(timestamp) {
  const date = new Date(timestamp)
  return date.toLocaleString('en-US', {
    month: 'short',
    day: 'numeric',
    hour: '2-digit',
    minute: '2-digit'
  })
}

export function formatConfidence(confidence) {
  return `${(confidence * 100).toFixed(0)}%`
}

export function getStatusLabel(status) {
  switch (status) {
    case 'normal':
      return '✅ Normal'
    case 'potential_anomaly':
      return '⚠️ Potential Anomaly'
    case 'uncertain':
      return '❓ Uncertain'
    default:
      return 'Unknown'
  }
}
