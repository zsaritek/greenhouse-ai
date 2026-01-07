import { CheckCircle, AlertTriangle, HelpCircle, Activity } from 'lucide-react'

export default function AIAssessment({ result, isAnalyzing }) {
  if (isAnalyzing) {
    return (
      <div className="bg-white rounded-lg shadow-md p-6">
        <h2 className="text-xl font-bold text-gray-900 mb-4">
          🤖 AI Assessment
        </h2>
        <div className="flex flex-col items-center justify-center py-12 space-y-4">
          <Activity className="w-16 h-16 text-green-600 animate-pulse" />
          <p className="text-lg text-gray-600 font-medium">
            Analyzing sensor data and plant image...
          </p>
          <p className="text-sm text-gray-500">
            This may take a few seconds
          </p>
        </div>
      </div>
    )
  }

  if (!result) {
    return (
      <div className="bg-white rounded-lg shadow-md p-6">
        <h2 className="text-xl font-bold text-gray-900 mb-4">
          🤖 AI Assessment
        </h2>
        <div className="flex flex-col items-center justify-center py-12 space-y-4">
          <div className="bg-gray-100 p-4 rounded-full">
            <HelpCircle className="w-12 h-12 text-gray-400" />
          </div>
          <p className="text-gray-600 text-center">
            Upload sensor data and plant image, <br />
            then click <span className="font-semibold">"Analyze with AI"</span>
          </p>
        </div>
      </div>
    )
  }

  // Limit visual assessment to 25 words
  const limitWords = (text, maxWords = 25) => {
    if (!text) return text
    const words = text.split(' ')
    if (words.length <= maxWords) return text
    return words.slice(0, maxWords).join(' ') + '...'
  }

  const getStatusConfig = (status) => {
    switch (status) {
      case 'normal':
        return {
          icon: CheckCircle,
          color: 'text-green-600',
          bgColor: 'bg-green-50',
          borderColor: 'border-green-200',
          label: '✅ Normal'
        }
      case 'potential_anomaly':
        return {
          icon: AlertTriangle,
          color: 'text-orange-600',
          bgColor: 'bg-orange-50',
          borderColor: 'border-orange-200',
          label: '⚠️ Potential Anomaly'
        }
      case 'uncertain':
        return {
          icon: HelpCircle,
          color: 'text-yellow-600',
          bgColor: 'bg-yellow-50',
          borderColor: 'border-yellow-200',
          label: '❓ Uncertain'
        }
      default:
        return {
          icon: HelpCircle,
          color: 'text-gray-600',
          bgColor: 'bg-gray-50',
          borderColor: 'border-gray-200',
          label: 'Unknown'
        }
    }
  }

  const config = getStatusConfig(result.status)
  const Icon = config.icon

  return (
    <div className={`rounded-lg shadow-md p-6 border-2 ${config.borderColor} ${config.bgColor}`}>
      <h2 className="text-xl font-bold text-gray-900 mb-4">
        🤖 AI Assessment
      </h2>

      {/* Status Header */}
      <div className="flex items-center justify-between mb-4">
        <div className="flex items-center space-x-3">
          <Icon className={`w-8 h-8 ${config.color}`} />
          <span className="text-2xl font-bold text-gray-900">
            {config.label}
          </span>
        </div>
        <div className="text-right">
          <div className="text-sm text-gray-600">Confidence</div>
          <div className="text-3xl font-bold text-gray-900">
            {(result.confidence * 100).toFixed(0)}%
          </div>
        </div>
      </div>

      {/* Confidence Meter */}
      <div className="mb-6">
        <div className="w-full bg-gray-200 rounded-full h-3">
          <div
            className={`h-3 rounded-full transition-all duration-500 ${
              result.confidence > 0.7 ? 'bg-green-500' :
              result.confidence > 0.4 ? 'bg-yellow-500' :
              'bg-red-500'
            }`}
            style={{ width: `${result.confidence * 100}%` }}
          />
        </div>
      </div>

      {/* Multi-Modal Assessment */}
      {result.visual_assessment && (
        <div className="grid grid-cols-2 gap-4 mb-4">
          <div className="bg-white rounded-lg p-4 border border-gray-200">
            <div className="text-xs font-semibold text-gray-700 mb-2">
              📊 Sensor Assessment
            </div>
            <div className="text-sm text-gray-600 leading-relaxed">
              {result.primary_concern 
                ? `Primary concern: ${result.primary_concern}`
                : 'All sensors normal'}
            </div>
          </div>
          
          <div className="bg-white rounded-lg p-4 border border-gray-200">
            <div className="text-xs font-semibold text-gray-700 mb-2">
              👁️ Visual Assessment
            </div>
            <div className="text-sm text-gray-600 leading-relaxed min-h-[3rem]">
              {limitWords(result.visual_assessment, 25)}
            </div>
          </div>
        </div>
      )}

      {/* Signals Agreement */}
      {result.signals_agree !== null && result.visual_assessment && (
        <div className={`mb-4 p-3 rounded-lg ${
          result.signals_agree
            ? 'bg-green-50 border border-green-200'
            : 'bg-red-50 border border-red-200'
        }`}>
          <div className="font-semibold text-sm mb-1">
            {result.signals_agree
              ? '✓ Sensor and visual data agree'
              : '✗ Conflicting signals detected'}
          </div>
          {!result.signals_agree && (
            <div className="text-xs text-gray-700">
              This discrepancy requires human investigation
            </div>
          )}
        </div>
      )}

      {/* Reasoning */}
      <div className="mb-4">
        <div className="text-sm font-semibold text-gray-700 mb-2">
          Analysis
        </div>
        <div className="text-sm text-gray-800 bg-white p-3 rounded-lg border border-gray-200">
          {result.reasoning}
        </div>
      </div>

      {/* Recommended Action */}
      {result.recommended_action && (
        <div className="border-t pt-4 mb-4">
          <div className="text-sm font-semibold text-gray-700 mb-2">
            Recommended Action
          </div>
          <div className="text-sm font-medium text-gray-900 bg-white p-3 rounded-lg border border-gray-300">
            {result.recommended_action}
          </div>
        </div>
      )}

      {/* Pager Alert - Mock Notification */}
      {result.pagerAlert?.triggered && (
        <div className="border-t pt-4 mb-4">
          <div className="bg-red-50 border-2 border-red-300 rounded-xl p-5 shadow-lg">
            <div className="flex items-center space-x-3 mb-4">
              <div className="bg-red-600 p-2 rounded-full animate-pulse">
                <svg className="w-6 h-6 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 17h5l-1.405-1.405A2.032 2.032 0 0118 14.158V11a6.002 6.002 0 00-4-5.659V5a2 2 0 10-4 0v.341C7.67 6.165 6 8.388 6 11v3.159c0 .538-.214 1.055-.595 1.436L4 17h5m6 0v1a3 3 0 11-6 0v-1m6 0H9" />
                </svg>
              </div>
              <div className="flex-1">
                <h3 className="text-lg font-bold text-red-900">🚨 Pager Alert Triggered</h3>
                <p className="text-xs text-red-700 mt-0.5">Human inspection required</p>
              </div>
            </div>
            
            <div className="space-y-3">
              <div className="bg-white rounded-lg p-3 border border-red-200">
                <div className="flex items-center justify-between">
                  <div className="flex items-center space-x-2">
                    <span className="text-lg">📱</span>
                    <span className="text-sm font-semibold text-gray-700">SMS Notification</span>
                  </div>
                  <span className="text-xs bg-green-100 text-green-800 px-2 py-1 rounded-full font-medium">✓ SENT</span>
                </div>
                <p className="text-xs text-gray-600 mt-2 ml-7">To: {result.pagerAlert.smsRecipient}</p>
              </div>
              
              <div className="bg-white rounded-lg p-3 border border-red-200">
                <div className="flex items-center justify-between">
                  <div className="flex items-center space-x-2">
                    <span className="text-lg">☎️</span>
                    <span className="text-sm font-semibold text-gray-700">Voice Call</span>
                  </div>
                  <span className="text-xs bg-green-100 text-green-800 px-2 py-1 rounded-full font-medium">✓ INITIATED</span>
                </div>
                <p className="text-xs text-gray-600 mt-2 ml-7">To: {result.pagerAlert.callRecipient}</p>
              </div>
              
              <div className="bg-yellow-50 rounded-lg p-3 border border-yellow-300">
                <div className="flex items-start space-x-2">
                  <span className="text-lg mt-0.5">⚠️</span>
                  <div className="flex-1">
                    <p className="text-xs font-semibold text-yellow-900 mb-1">Alert Reason:</p>
                    <p className="text-xs text-yellow-800">{result.pagerAlert.reason}</p>
                  </div>
                </div>
              </div>
              
              <div className="text-xs text-gray-500 text-center pt-2">
                Alert sent at {new Date(result.pagerAlert.sentAt).toLocaleTimeString()}
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Timestamp */}
      <div className="mt-4 text-xs text-gray-500">
        Analyzed at: {new Date(result.timestamp).toLocaleString()}
      </div>
    </div>
  )
}
