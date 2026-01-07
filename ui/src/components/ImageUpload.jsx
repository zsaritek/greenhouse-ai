import { Upload, X, Image as ImageIcon } from 'lucide-react'
import { useState } from 'react'

export default function ImageUpload({ image, onImageChange }) {
  const [preview, setPreview] = useState(null)

  const handleFileChange = (e) => {
    const file = e.target.files[0]
    if (file) {
      onImageChange(file)
      
      // Create preview
      const reader = new FileReader()
      reader.onloadend = () => {
        setPreview(reader.result)
      }
      reader.readAsDataURL(file)
    }
  }

  const handleRemove = () => {
    onImageChange(null)
    setPreview(null)
  }

  return (
    <div className="bg-white rounded-lg shadow-md p-6">
      <h2 className="text-xl font-bold text-gray-900 mb-4">
        📸 Plant Image
      </h2>
      
      {!preview ? (
        <label className="flex flex-col items-center justify-center w-full h-64 border-2 border-dashed border-gray-300 rounded-lg cursor-pointer hover:border-green-500 hover:bg-gray-50 transition">
          <div className="flex flex-col items-center justify-center pt-5 pb-6">
            <Upload className="w-12 h-12 text-gray-400 mb-3" />
            <p className="mb-2 text-sm text-gray-600">
              <span className="font-semibold">Click to upload</span> or drag and drop
            </p>
            <p className="text-xs text-gray-500">
              PNG, JPG up to 10MB
            </p>
          </div>
          <input
            type="file"
            className="hidden"
            accept="image/*"
            onChange={handleFileChange}
          />
        </label>
      ) : (
        <div className="relative">
          <img
            src={preview}
            alt="Uploaded plant"
            className="w-full h-64 object-cover rounded-lg"
          />
          <button
            onClick={handleRemove}
            className="absolute top-2 right-2 bg-red-500 hover:bg-red-600 text-white p-2 rounded-full shadow-lg transition"
          >
            <X className="w-4 h-4" />
          </button>
          
          <div className="mt-3 flex items-center space-x-2 text-sm text-green-600">
            <ImageIcon className="w-4 h-4" />
            <span className="font-medium">Image ready for analysis</span>
          </div>
        </div>
      )}
    </div>
  )
}
