import { AlertCircle, X } from 'lucide-react'

export default function AlertBanner({ onClose }) {
  return (
    <div className="bg-orange-50 border-l-4 border-orange-500">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4">
        <div className="flex items-start justify-between">
          <div className="flex items-start space-x-3">
            <AlertCircle className="w-6 h-6 text-orange-600 mt-0.5 flex-shrink-0" />
            <div className="flex-1">
              <h3 className="text-sm font-semibold text-orange-900 mb-1">
                Demo Alert: High Temperature Detected
              </h3>
              <p className="text-sm text-orange-800">
                This is a demonstration alert banner. In production, this would show real-time 
                alerts from your greenhouse monitoring system. No backend connection required for this demo.
              </p>
              <div className="mt-2 flex space-x-4 text-xs">
                <span className="text-orange-700">
                  <span className="font-semibold">Temp:</span> 36°C
                </span>
                <span className="text-orange-700">
                  <span className="font-semibold">Time:</span> 2:47 AM
                </span>
                <span className="text-orange-700">
                  <span className="font-semibold">Severity:</span> Medium
                </span>
              </div>
            </div>
          </div>
          <button
            onClick={onClose}
            className="flex-shrink-0 ml-4 text-orange-600 hover:text-orange-800 transition"
          >
            <X className="w-5 h-5" />
          </button>
        </div>
      </div>
    </div>
  )
}
