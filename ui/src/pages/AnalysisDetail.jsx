import { useState, useEffect } from 'react'
import { useParams, useNavigate } from 'react-router-dom'
import { ArrowLeft, AlertTriangle, Loader2 } from 'lucide-react'
import SensorReadings from '../components/SensorReadings'
import AIAssessment from '../components/AIAssessment'

const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:8000'

export default function AnalysisDetail() {
  const { id } = useParams()
  const navigate = useNavigate()
  const [analysis, setAnalysis] = useState(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState(null)

  useEffect(() => {
    loadAnalysis()
  }, [id])

  const loadAnalysis = async () => {
    try {
      setLoading(true)
      const res = await fetch(`${API_URL}/api/analysis/${id}`)

      if (!res.ok) {
        throw new Error('Analysis not found')
      }

      const data = await res.json()
      setAnalysis(data)
    } catch (err) {
      setError(err.message)
    } finally {
      setLoading(false)
    }
  }

  const handleBackClick = () => {
    navigate('/', { replace: true })
  }

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-gray-50 to-gray-100 flex items-center justify-center">
        <div className="text-center">
          <Loader2 className="w-12 h-12 text-green-600 animate-spin mx-auto mb-4" />
          <p className="text-gray-600">Loading analysis...</p>
        </div>
      </div>
    )
  }

  if (error) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-gray-50 to-gray-100 flex items-center justify-center">
        <div className="bg-white rounded-2xl shadow-xl p-8 max-w-md">
          <div className="text-center">
            <AlertTriangle className="w-12 h-12 text-red-500 mx-auto mb-4" />
            <h2 className="text-xl font-bold text-gray-900 mb-2">Error</h2>
            <p className="text-gray-600 mb-6">{error}</p>
            <button
              onClick={handleBackClick}
              className="px-6 py-3 bg-green-600 hover:bg-green-700 text-white rounded-xl font-semibold transition"
            >
              Back to List
            </button>
          </div>
        </div>
      </div>
    )
  }

  const formatSensorData = (data) => ({
    temperature: data.temperature,
    humidity: data.humidity,
    co2: data.co2,
    soilMoisture: data.soilMoisture,
    timestamp: data.timestamp
  })

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-50 to-gray-100">
      {/* Header */}
      <header className="bg-white shadow-sm border-b border-gray-200 sticky top-0 z-50">
        <div className="max-w-7xl mx-auto px-6 py-4">
          <button
            onClick={handleBackClick}
            className="flex items-center space-x-2 px-4 py-2 text-gray-700 hover:text-gray-900 hover:bg-gray-100 rounded-lg transition-all group"
          >
            <ArrowLeft className="w-5 h-5 group-hover:-translate-x-1 transition-transform" />
            <span className="font-medium">Back to Analysis List</span>
          </button>
        </div>
      </header>

      {/* Main Content */}
      <main className="max-w-7xl mx-auto px-6 py-8">
        {/* Header with Location Info */}
        <div className="mb-6">
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-3xl font-bold text-gray-900">
                Analysis Detail
              </h1>
              <p className="text-gray-600 mt-1">
                {new Date(analysis.timestamp).toLocaleString()}
              </p>
            </div>
            <div className="flex items-center space-x-3">
              {analysis.location && (
                <div className="flex items-center space-x-2 px-4 py-2 bg-blue-50 border-2 border-blue-200 rounded-xl">
                  <span className="text-2xl">📍</span>
                  <div>
                    <div className="text-xs text-blue-600 font-medium uppercase tracking-wide">Location</div>
                    <div className="text-sm font-bold text-blue-900">{analysis.location}</div>
                  </div>
                </div>
              )}
              {analysis.camera_id && (
                <div className="flex items-center space-x-2 px-4 py-2 bg-gray-50 border-2 border-gray-200 rounded-xl">
                  <span className="text-2xl">📷</span>
                  <div>
                    <div className="text-xs text-gray-600 font-medium uppercase tracking-wide">Camera</div>
                    <div className="text-sm font-bold text-gray-900 font-mono">{analysis.camera_id}</div>
                  </div>
                </div>
              )}
            </div>
          </div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {/* Left Column */}
          <div className="space-y-6">
            {/* Sensor Readings */}
            <div className="bg-white rounded-2xl shadow-lg p-6">
              <h2 className="text-xl font-bold text-gray-900 mb-4">
                📊 Sensor Readings
              </h2>
              <SensorReadings
                data={formatSensorData(analysis.sensorData)}
                onChange={() => { }}
                readOnly={true}
              />
            </div>

            {/* Plant Image */}
            {analysis.image && (
              <div className="bg-white rounded-2xl shadow-lg p-6">
                <h2 className="text-xl font-bold text-gray-900 mb-4">
                  📸 Plant Image
                </h2>
                <img
                  src={`${API_URL}/api/mock_data/images/${analysis.image}`}
                  alt="Plant"
                  className="w-full rounded-xl shadow-md"
                  onError={(e) => {
                    e.target.src = 'data:image/svg+xml,%3Csvg xmlns="http://www.w3.org/2000/svg" width="400" height="300"%3E%3Crect fill="%23f0f0f0" width="400" height="300"/%3E%3Ctext x="50%25" y="50%25" text-anchor="middle" fill="%23999" font-size="18"%3EImage not available%3C/text%3E%3C/svg%3E'
                  }}
                />
              </div>
            )}
          </div>

          {/* Right Column */}
          <div className="space-y-6">
            {/* AI Assessment */}
            <AIAssessment
              result={analysis}
              isAnalyzing={false}
            />
          </div>
        </div>
      </main>
    </div>
  )
}
