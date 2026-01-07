import { Clock, TrendingUp } from 'lucide-react'

export default function AnalysisHistory({ history }) {
  if (history.length === 0) return null

  return (
    <div className="bg-white rounded-lg shadow-md p-6">
      <div className="flex items-center space-x-2 mb-4">
        <Clock className="w-5 h-5 text-gray-600" />
        <h2 className="text-xl font-bold text-gray-900">
          Analysis History
        </h2>
        <span className="bg-gray-200 text-gray-700 text-xs font-semibold px-2 py-1 rounded-full">
          {history.length}
        </span>
      </div>

      <div className="space-y-3">
        {history.map((item, index) => {
          const statusColor = 
            item.status === 'normal' ? 'bg-green-100 text-green-800' :
            item.status === 'potential_anomaly' ? 'bg-orange-100 text-orange-800' :
            'bg-yellow-100 text-yellow-800'

          return (
            <div
              key={index}
              className="border border-gray-200 rounded-lg p-4 hover:shadow-md transition"
            >
              <div className="flex items-start justify-between">
                <div className="flex-1">
                  <div className="flex items-center space-x-2 mb-2">
                    <span className={`text-xs font-semibold px-2 py-1 rounded ${statusColor}`}>
                      {item.status.replace('_', ' ').toUpperCase()}
                    </span>
                    <span className="text-sm font-medium text-gray-600">
                      Confidence: {(item.confidence * 100).toFixed(0)}%
                    </span>
                  </div>
                  <p className="text-sm text-gray-700">
                    {item.reasoning}
                  </p>
                </div>
                <div className="text-xs text-gray-500 ml-4 whitespace-nowrap">
                  {new Date(item.timestamp).toLocaleTimeString()}
                </div>
              </div>
            </div>
          )
        })}
      </div>
    </div>
  )
}
