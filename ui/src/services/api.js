const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:8000'

export async function analyzeGreenhouse(sensorData, imageFile) {
  const formData = new FormData()
  
  // Add sensor data
  formData.append('sensor_data', JSON.stringify(sensorData))
  
  // Add image if provided
  if (imageFile) {
    formData.append('image', imageFile)
  }
  
  const response = await fetch(`${API_URL}/api/analyze`, {
    method: 'POST',
    body: formData
  })
  
  if (!response.ok) {
    throw new Error(`API error: ${response.statusText}`)
  }
  
  return response.json()
}

export async function getAnalysisHistory() {
  const response = await fetch(`${API_URL}/api/history`)
  
  if (!response.ok) {
    throw new Error(`API error: ${response.statusText}`)
  }
  
  return response.json()
}
