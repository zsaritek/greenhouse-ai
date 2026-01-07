import { Thermometer, Droplets, Wind, Sprout } from 'lucide-react'

export default function SensorReadings({ data, onChange, readOnly = false }) {
  const sensors = [
    {
      id: 'temperature',
      label: 'Temperature',
      value: data.temperature,
      unit: '°C',
      icon: Thermometer,
      color: 'text-red-600',
      bgColor: 'bg-red-50'
    },
    {
      id: 'humidity',
      label: 'Humidity',
      value: data.humidity,
      unit: '%',
      icon: Droplets,
      color: 'text-blue-600',
      bgColor: 'bg-blue-50'
    },
    {
      id: 'co2',
      label: 'CO₂',
      value: data.co2,
      unit: 'ppm',
      icon: Wind,
      color: 'text-purple-600',
      bgColor: 'bg-purple-50'
    },
    {
      id: 'soilMoisture',
      label: 'Soil Moisture',
      value: data.soilMoisture,
      unit: '%',
      icon: Sprout,
      color: 'text-green-600',
      bgColor: 'bg-green-50'
    }
  ]

  return (
    <div className="grid grid-cols-2 gap-4">
      {sensors.map(sensor => {
        const Icon = sensor.icon
        return (
          <div key={sensor.id} className={`${sensor.bgColor} rounded-xl p-4`}>
            <div className="flex items-center justify-between mb-2">
              <span className="text-sm font-medium text-gray-700">
                {sensor.label}
              </span>
              <Icon className={`w-5 h-5 ${sensor.color}`} />
            </div>
            
            <div className="flex items-baseline space-x-2">
              {readOnly ? (
                <div className="text-3xl font-bold text-gray-900">
                  {sensor.value}
                </div>
              ) : (
                <input
                  type="number"
                  value={data[sensor.id]}
                  onChange={(e) => onChange({
                    ...data,
                    [sensor.id]: parseFloat(e.target.value) || 0
                  })}
                  className="text-3xl font-bold bg-transparent border-b-2 border-gray-300 focus:border-gray-600 outline-none w-20"
                />
              )}
              <span className="text-lg font-semibold text-gray-600">
                {sensor.unit}
              </span>
            </div>
          </div>
        )
      })}
    </div>
  )
}
