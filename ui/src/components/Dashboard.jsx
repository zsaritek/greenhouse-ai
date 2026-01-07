import { useState } from 'react'
import { Sprout, Activity, AlertCircle } from 'lucide-react'
import SensorReadings from './SensorReadings'
import ImageUpload from './ImageUpload'
import AIAssessment from './AIAssessment'
import AnalysisHistory from './AnalysisHistory'
import AlertBanner from './AlertBanner'
import { analyzeGreenhouse } from '../services/api'

export default function Dashboard() {
  const [sensorData, setSensorData] = useState({
    temperature: 24,
    humidity: 65,
    co2: 420,
    soilMoisture: 55,
    timestamp: new Date().toISOString()
  })

  const [uploadedImage, setUploadedImage] = useState(null)
  const [analysis, setAnalysis] = useState(null)
  const [isAnalyzing, setIsAnalyzing] = useState(false)
  const [analysisHistory, setAnalysisHistory] = useState([])
  const [showAlert, setShowAlert] = useState(false)

  const handleAnalyze = async () => {
    setIsAnalyzing(true)

    try {
      const result = await analyzeGreenhouse(sensorData, uploadedImage)
      setAnalysis(result)
      setAnalysisHistory(prev => [result, ...prev])
    } catch (error) {
      console.error('Analysis failed:', error)
      setAnalysis({
        status: 'uncertain',
        confidence: 0.0,
        reasoning: error?.message || 'Analysis failed. Please try again.',
        visual_assessment: null,
        signals_agree: null,
        primary_concern: null,
        recommended_action: 'Check that the backend is running and retry.',
        timestamp: new Date().toISOString(),
        tokensUsed: 0,
        cost: '0.000000'
      })
    } finally {
      setIsAnalyzing(false)
    }
  }

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <header className="bg-white shadow-sm border-b border-gray-200">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-3">
              <div className="bg-green-100 p-2 rounded-lg">
                <Sprout className="w-8 h-8 text-green-600" />
              </div>
              <div>
                <h1 className="text-2xl font-bold text-gray-900">
                  Greenhouse Monitor
                </h1>
                <p className="text-sm text-gray-600">
                  AI-Powered Cherry Tomato Health Analysis
                </p>
              </div>
            </div>

            <div className="flex items-center space-x-4">
              <button
                onClick={() => setShowAlert(!showAlert)}
                className="flex items-center space-x-2 px-4 py-2 bg-gray-100 hover:bg-gray-200 rounded-lg transition"
              >
                <AlertCircle className="w-5 h-5 text-gray-600" />
                <span className="text-sm font-medium text-gray-700">
                  {showAlert ? 'Hide' : 'Show'} Alert Demo
                </span>
              </button>
            </div>
          </div>
        </div>
      </header>

      {/* Alert Banner (Demo - No Backend) */}
      {showAlert && <AlertBanner onClose={() => setShowAlert(false)} />}

      {/* Main Content */}
      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">

          {/* Left Column */}
          <div className="space-y-6">
            {/* Sensor Readings */}
            <SensorReadings
              data={sensorData}
              onChange={setSensorData}
            />

            {/* Image Upload */}
            <ImageUpload
              image={uploadedImage}
              onImageChange={setUploadedImage}
            />

            {/* Analyze Button */}
            <button
              onClick={handleAnalyze}
              disabled={isAnalyzing}
              className={`w-full py-4 rounded-lg font-semibold text-white text-lg transition shadow-lg ${isAnalyzing
                  ? 'bg-gray-400 cursor-not-allowed'
                  : 'bg-green-600 hover:bg-green-700 active:scale-95'
                }`}
            >
              {isAnalyzing ? (
                <span className="flex items-center justify-center space-x-2">
                  <Activity className="w-5 h-5 animate-pulse" />
                  <span>Analyzing...</span>
                </span>
              ) : (
                '🤖 Analyze with AI'
              )}
            </button>
          </div>

          {/* Right Column */}
          <div className="space-y-6">
            {/* AI Assessment */}
            <AIAssessment
              result={analysis}
              isAnalyzing={isAnalyzing}
            />
          </div>
        </div>

        {/* Analysis History */}
        {analysisHistory.length > 0 && (
          <div className="mt-8">
            <AnalysisHistory history={analysisHistory} />
          </div>
        )}
      </main>
    </div>
  )
}
