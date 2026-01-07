import { useState, useEffect } from 'react'
import { useNavigate } from 'react-router-dom'
import { Activity, CheckCircle, XCircle, Clock, RefreshCw, Loader2, Bell } from 'lucide-react'

const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:8000'

export default function AnalysisList() {
  const navigate = useNavigate()
  const [status, setStatus] = useState(null)
  const [isRunning, setIsRunning] = useState(false)
  const [error, setError] = useState(null)
  const [initialLoading, setInitialLoading] = useState(true)

  // Load existing results on mount
  useEffect(() => {
    const loadExistingResults = async () => {
      try {
        const res = await fetch(`${API_URL}/api/analysis-status`)
        const data = await res.json()

        if (data.results && data.results.length > 0) {
          setStatus(data)
        }
      } catch (err) {
        console.error('Failed to load existing results:', err)
      } finally {
        setInitialLoading(false)
      }
    }

    loadExistingResults()
  }, [])

  // Poll for status every 5 seconds when analyzing
  useEffect(() => {
    if (!isRunning) return

    const interval = setInterval(async () => {
      try {
        const res = await fetch(`${API_URL}/api/analysis-status`)
        const data = await res.json()
        setStatus(data)

        if (data.status === 'complete') {
          setIsRunning(false)
        }
      } catch (err) {
        console.error('Poll error:', err)
      }
    }, 5000)

    return () => clearInterval(interval)
  }, [isRunning])

  const handleStartAnalysis = async () => {
    setError(null)
    setIsRunning(true)
    setStatus({ status: 'processing', completed: 0, total: 12, results: [] })

    try {
      const res = await fetch(`${API_URL}/api/start-analysis`, {
        method: 'POST'
      })
      const data = await res.json()

      if (data.error) {
        setError(data.error)
        setIsRunning(false)
        return
      }

      // Start polling immediately
      setTimeout(async () => {
        const statusRes = await fetch(`${API_URL}/api/analysis-status`)
        const statusData = await statusRes.json()
        setStatus(statusData)
      }, 1000)
    } catch (err) {
      setError(err.message)
      setIsRunning(false)
    }
  }

  const handleRowClick = (analysisId) => {
    navigate(`/analysis/${analysisId}`)
  }

  const needsHumanCheck = (result) => {
    return (
      result.confidence < 0.6 ||
      result.status === 'uncertain' ||
      result.signals_agree === false ||
      result.pagerAlert?.triggered
    )
  }

  const getStatusIcon = (result) => {
    if (result.status === 'normal' && result.confidence > 0.7) {
      return <CheckCircle className="w-6 h-6 text-green-600" />
    }
    return <XCircle className="w-6 h-6 text-orange-500" />
  }

  const formatTime = (timestamp) => {
    const date = new Date(timestamp)
    return date.toLocaleTimeString('en-US', {
      hour: '2-digit',
      minute: '2-digit',
      hour12: false
    })
  }

  if (initialLoading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-gray-50 to-gray-100 flex items-center justify-center">
        <Loader2 className="w-12 h-12 text-green-600 animate-spin" />
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-50 to-gray-100">
      {/* Header */}
      <header className="bg-white shadow-sm border-b border-gray-200">
        <div className="max-w-7xl mx-auto px-6 py-6">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-4">
              <div className="bg-gradient-to-br from-green-400 to-green-600 p-3 rounded-xl shadow-lg">
                <Activity className="w-8 h-8 text-white" />
              </div>
              <div>
                <h1 className="text-3xl font-bold text-gray-900">
                  Greenhouse Monitor
                </h1>
                <p className="text-sm text-gray-600 mt-1">
                  AI-Powered Plant Health Analysis
                </p>
              </div>
            </div>

            {!isRunning && status && status.results.length > 0 && (
              <div className="flex items-center space-x-3">
                <button
                  onClick={handleStartAnalysis}
                  className="flex items-center space-x-2 px-6 py-3 bg-green-600 hover:bg-green-700 text-white rounded-xl font-semibold shadow-lg transition transform hover:scale-105"
                >
                  <RefreshCw className="w-5 h-5" />
                  <span>Run Again</span>
                </button>
              </div>
            )}
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main className="max-w-7xl mx-auto px-6 py-8">
        {/* Empty State */}
        {!status && !isRunning && (
          <div className="bg-white rounded-2xl shadow-xl p-16 text-center">
            <div className="inline-flex items-center justify-center w-24 h-24 bg-gradient-to-br from-green-100 to-green-200 rounded-full mb-6">
              <Activity className="w-12 h-12 text-green-600" />
            </div>
            <h2 className="text-2xl font-bold text-gray-900 mb-3">
              Ready to Analyze
            </h2>
            <p className="text-gray-600 mb-8 max-w-md mx-auto">
              Run comprehensive AI analysis simulating a full day of greenhouse monitoring (09:00 - 12:15)
            </p>

            <button
              onClick={handleStartAnalysis}
              className="inline-flex items-center space-x-3 px-8 py-4 bg-gradient-to-r from-green-500 to-green-600 hover:from-green-600 hover:to-green-700 text-white rounded-xl font-semibold shadow-lg transition transform hover:scale-105"
            >
              <Activity className="w-6 h-6" />
              <span className="text-lg">Start Analysis</span>
            </button>
          </div>
        )}

        {/* Error State */}
        {error && (
          <div className="bg-red-50 border-2 border-red-200 rounded-xl p-4 mb-6">
            <p className="text-red-800 font-medium">Error: {error}</p>
          </div>
        )}

        {/* Processing/Results */}
        {status && (
          <div className="space-y-6">
            {/* Progress Bar */}
            {isRunning && (
              <div className="bg-white rounded-2xl shadow-lg p-6">
                <div className="flex items-center justify-between mb-4">
                  <div className="flex items-center space-x-3">
                    <Loader2 className="w-6 h-6 text-green-600 animate-spin" />
                    <span className="text-lg font-semibold text-gray-900">
                      Analyzing...
                    </span>
                  </div>
                  <span className="text-sm font-medium text-gray-600">
                    {status.completed} / {status.total} complete
                  </span>
                </div>
                <div className="w-full bg-gray-200 rounded-full h-3">
                  <div
                    className="bg-gradient-to-r from-green-500 to-green-600 h-3 rounded-full transition-all duration-500"
                    style={{ width: `${(status.completed / status.total) * 100}%` }}
                  />
                </div>
              </div>
            )}

            {/* Results List */}
            {status.results.length > 0 && (
              <div className="bg-white rounded-2xl shadow-xl overflow-hidden">
                <div className="px-6 py-4 bg-gradient-to-r from-gray-50 to-gray-100 border-b border-gray-200">
                  <h2 className="text-xl font-bold text-gray-900">
                    Analysis Results
                  </h2>
                </div>
                <div className="divide-y divide-gray-100">
                  {status.results.map((result) => (
                    <div
                      key={result.id}
                      onClick={() => handleRowClick(result.id)}
                      className="px-6 py-5 hover:bg-gradient-to-r hover:from-green-50 hover:to-transparent cursor-pointer transition-all duration-200 group"
                    >
                      <div className="flex items-start justify-between gap-4">
                        <div className="flex items-start space-x-4 flex-1 min-w-0">
                          <div className="flex-shrink-0 mt-1">
                            {getStatusIcon(result)}
                          </div>
                          <div className="flex-1 min-w-0">
                            <div className="flex items-center space-x-2 mb-2 flex-wrap gap-2">
                              <Clock className="w-4 h-4 text-gray-400 flex-shrink-0" />
                              <span className="text-base font-semibold text-gray-900 whitespace-nowrap">
                                {formatTime(result.timestamp)}
                              </span>
                              {result.location && (
                                <span className="inline-flex items-center px-2 py-1 rounded-full text-xs font-medium bg-blue-100 text-blue-800 whitespace-nowrap">
                                  📍 {result.location}
                                </span>
                              )}
                              {result.camera_id && (
                                <span className="inline-flex items-center px-2 py-1 rounded text-xs font-mono bg-gray-100 text-gray-700 whitespace-nowrap">
                                  {result.camera_id}
                                </span>
                              )}
                            </div>
                            <div className="flex items-center space-x-2 mb-2 flex-wrap gap-2">
                              {result.pagerAlert?.triggered && (
                                <span className="inline-flex items-center px-2 py-1 rounded-full text-xs font-bold bg-red-100 text-red-800 border-2 border-red-300 animate-pulse whitespace-nowrap">
                                  <Bell className="w-3 h-3 mr-1" />
                                  PAGER ALERT
                                </span>
                              )}
                              {needsHumanCheck(result) && !result.pagerAlert?.triggered && (
                                <span className="inline-flex items-center px-2 py-1 rounded-full text-xs font-bold bg-orange-100 text-orange-800 border-2 border-orange-300 whitespace-nowrap">
                                  <svg className="w-3 h-3 mr-1" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
                                  </svg>
                                  HUMAN CHECK
                                </span>
                              )}
                            </div>
                            <p className="text-sm text-gray-600 line-clamp-2">
                              {result.reasoning}
                            </p>
                          </div>
                        </div>
                        <div className="flex-shrink-0 text-right">
                          <div className="text-2xl font-bold text-gray-900">
                            {(result.confidence * 100).toFixed(0)}%
                          </div>
                          <div className="text-xs text-gray-500 uppercase tracking-wide whitespace-nowrap">
                            Confidence
                          </div>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            )}
          </div>
        )}
      </main>
    </div>
  )
}
