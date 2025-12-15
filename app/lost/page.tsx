'use client'

import { useState } from 'react'
import { useAuth } from '@/utils/useAuth'
import Link from 'next/link'

const categories = ['Electronics', 'Accessories', 'Clothing', 'Books', 'Bags', 'Jewelry', 'Documents', 'Other']

export default function LostPage() {
  const { user, loading } = useAuth()

  const [formData, setFormData] = useState({
    title: '',
    description: '',
    category: '',
    location: '',
    dateLost: '',
    image: '',
    userName: '',
  })

  const [imagePreview, setImagePreview] = useState<string | null>(null)
  const [submitting, setSubmitting] = useState(false)
  const [error, setError] = useState('')
  const [success, setSuccess] = useState('')
  const [dragActive, setDragActive] = useState(false)

  if (loading) {
    return <div className="min-h-screen flex items-center justify-center">Loading...</div>
  }

  if (!user) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="bg-white p-8 rounded-lg shadow-md text-center">
          <h2 className="text-2xl font-bold mb-4">Login Required</h2>
          <p className="text-gray-600 mb-6">Please log in to report a lost item.</p>
          <Link href="/" className="text-blue-500 hover:underline">
            Go back home
          </Link>
        </div>
      </div>
    )
  }





  const handleImageChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    if (file) {
      setError('')
      

      // Validate file size (1MB max for better performance)
      if (file.size > 1 * 1024 * 1024) {
        setError('Image size must be less than 1MB')
        return
      }

      // Validate file type
      const validTypes = ['image/jpeg', 'image/jpg', 'image/png', 'image/webp', 'image/gif']
      if (!validTypes.includes(file.type.toLowerCase())) {
        setError('Please select a valid image file (JPEG, PNG, WebP, or GIF)')
        return
      }

      const reader = new FileReader()
      reader.onloadend = () => {
        const result = reader.result as string
        
        if (!result) {
          setError('Failed to read image file. Please try again.')
          return
        }
        
        // Create a new image element to validate the file
        const img = new Image()
        img.onload = () => {
          try {
            // Compress image with better error handling
            compressImage(result, 800, 600, 0.8).then((compressedDataUrl) => {
              // Final validation - ensure compressed image is under 500KB
              if (compressedDataUrl.length > 500000) {
                setError('Image is too large after compression. Please try a smaller image.')
                return
              }
              
              setImagePreview(compressedDataUrl)
              setFormData(prev => ({ ...prev, image: compressedDataUrl }))
              setError('')
            }).catch((compressionError) => {
              console.error('Compression failed:', compressionError)
              // If compression fails, use original but validate size
              if (result.length > 1000000) { // 1MB limit for uncompressed
                setError('Image is too large. Please try a smaller image.')
                return
              }
              setImagePreview(result)
              setFormData(prev => ({ ...prev, image: result }))
              setError('')
            })
          } catch (error) {
            console.error('Image processing error:', error)
            setError('Failed to process image. Please try a different image.')
          }
        }
        img.onerror = () => {
          setError('Invalid image file. Please select a valid image.')
        }
        img.src = result
      }
      reader.onerror = () => {
        setError('Failed to read image file. Please try again.')
      }
      reader.readAsDataURL(file)
    }
  }



  // Image compression function with progressive quality reduction
  const compressImage = (dataUrl: string, maxWidth: number, maxHeight: number, quality: number): Promise<string> => {
    return new Promise((resolve, reject) => {
      const canvas = document.createElement('canvas')
      const ctx = canvas.getContext('2d')
      const img = new Image()
      
      if (!ctx) {
        reject(new Error('Failed to get canvas context'))
        return
      }
      
      img.onload = () => {
        try {
          // Calculate new dimensions
          let { width, height } = img
          
          // Ensure we don't exceed max dimensions
          if (width > height) {
            if (width > maxWidth) {
              height = (height * maxWidth) / width
              width = maxWidth
            }
          } else {
            if (height > maxHeight) {
              width = (width * maxHeight) / height
              height = maxHeight
            }
          }
          
          canvas.width = Math.floor(width)
          canvas.height = Math.floor(height)
          
          // Clear canvas and draw image
          ctx.clearRect(0, 0, canvas.width, canvas.height)
          ctx.drawImage(img, 0, 0, canvas.width, canvas.height)
          
          // Try with original quality first
          let compressedDataUrl = canvas.toDataURL('image/jpeg', quality)
          
          // If still too large, try with lower quality (more aggressive compression)
          let attempts = 0
          const maxAttempts = 3
          
          while (compressedDataUrl.length > 500000 && attempts < maxAttempts) {
            attempts++
            const lowerQuality = Math.max(0.1, quality - (attempts * 0.2))
            compressedDataUrl = canvas.toDataURL('image/jpeg', lowerQuality)
          }
          
          // If still too large, try with PNG (lossless but can be smaller for certain images)
          if (compressedDataUrl.length > 500000) {
            compressedDataUrl = canvas.toDataURL('image/png')
          }
          
          // Final fallback: if still too large, return original with warning
          if (compressedDataUrl.length > 500000) {
            console.warn('Image still large after compression, using original')
            resolve(dataUrl)
          } else {
            resolve(compressedDataUrl)
          }
        } catch (error) {
          console.error('Compression error:', error)
          // Fallback to original image
          resolve(dataUrl)
        }
      }
      
      img.onerror = () => {
        reject(new Error('Failed to load image for compression'))
      }
      
      img.src = dataUrl
    })
  }


  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => {
    const { name, value } = e.target
    setFormData({ ...formData, [name]: value })
  }

  // Drag and drop handlers
  const handleDrag = (e: React.DragEvent) => {
    e.preventDefault()
    e.stopPropagation()
    if (e.type === 'dragenter' || e.type === 'dragover') {
      setDragActive(true)
    } else if (e.type === 'dragleave') {
      setDragActive(false)
    }
  }

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault()
    e.stopPropagation()
    setDragActive(false)
    
    if (e.dataTransfer.files && e.dataTransfer.files[0]) {
      const file = e.dataTransfer.files[0]
      // Create a file list-like object
      const dt = new DataTransfer()
      dt.items.add(file)
      
      // Create a proper file input event
      const input = document.createElement('input')
      input.type = 'file'
      input.files = dt.files
      
      const syntheticEvent = {
        target: input
      } as React.ChangeEvent<HTMLInputElement>
      handleImageChange(syntheticEvent)
    }
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setError('')
    setSuccess('')

    // Validation
    if (!formData.title || !formData.description || !formData.category || !formData.location || !formData.dateLost || !formData.image) {
      setError('Please fill in all fields')
      return
    }

    setSubmitting(true)

    try {
      const response = await fetch('/api/lost', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },

        body: JSON.stringify({
          title: formData.title,
          description: formData.description,
          category: formData.category,
          image: formData.image,
          location: formData.location,
          dateLost: formData.dateLost,
          userId: user.uid,
          userName: user.displayName || formData.userName,
          userEmail: user.email,
        }),
      })

      const data = await response.json()

      if (!response.ok) {
        throw new Error(data.message || 'Failed to submit lost item')
      }

      setSuccess('Lost item reported successfully! We will help you find it.')

      setFormData({
        title: '',
        description: '',
        category: '',
        location: '',
        dateLost: '',
        image: '',
        userName: '',
      })
      setImagePreview(null)

      // Redirect to explore page after 2 seconds
      setTimeout(() => {
        window.location.href = '/explore'
      }, 2000)
    } catch (error: any) {
      setError(error.message || 'Failed to submit form')
    } finally {
      setSubmitting(false)
    }
  }

  return (
    <div className="min-h-screen bg-gray-50 py-8 sm:py-12">
      <div className="container mx-auto px-4 sm:px-6 max-w-2xl">
        <h1 className="text-3xl sm:text-4xl font-bold text-primary mb-6">Report a Lost Item</h1>

        {error && <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded mb-6">{error}</div>}

        {success && <div className="bg-green-100 border border-green-400 text-green-700 px-4 py-3 rounded mb-6">{success}</div>}

        <div className="bg-white rounded-lg shadow-md p-6 sm:p-8">
          <form onSubmit={handleSubmit} className="space-y-6">
            {/* Title */}
            <div>
              <label className="block text-sm font-semibold text-gray-700 mb-2">Item Title *</label>
              <input
                type="text"
                name="title"
                value={formData.title}
                onChange={handleChange}
                placeholder="e.g., Black iPhone 14 Pro"
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary focus:border-transparent"
                required
              />
            </div>

            {/* Category */}
            <div>
              <label className="block text-sm font-semibold text-gray-700 mb-2">Category *</label>
              <select
                name="category"
                value={formData.category}
                onChange={handleChange}
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary focus:border-transparent"
                required
              >
                <option value="">Select a category</option>
                {categories.map((cat) => (
                  <option key={cat} value={cat}>
                    {cat}
                  </option>
                ))}
              </select>
            </div>

            {/* Description */}
            <div>
              <label className="block text-sm font-semibold text-gray-700 mb-2">Description *</label>
              <textarea
                name="description"
                value={formData.description}
                onChange={handleChange}
                placeholder="Describe the item in detail (color, brand, unique features, etc.)"
                rows={4}
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary focus:border-transparent"
                required
              />
            </div>

            {/* Location */}
            <div>
              <label className="block text-sm font-semibold text-gray-700 mb-2">Location Lost *</label>
              <input
                type="text"
                name="location"
                value={formData.location}
                onChange={handleChange}
                placeholder="e.g., Library, Building A"
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary focus:border-transparent"
                required
              />
            </div>

            {/* Date Lost */}
            <div>
              <label className="block text-sm font-semibold text-gray-700 mb-2">Date Lost *</label>
              <input
                type="datetime-local"
                name="dateLost"
                value={formData.dateLost}
                onChange={handleChange}
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary focus:border-transparent"
                required
              />
            </div>


            {/* Image Upload */}
            <div>
              <label className="block text-sm font-semibold text-gray-700 mb-2">Image *</label>
              <div 
                className={`border-2 border-dashed rounded-lg p-6 text-center cursor-pointer transition ${
                  dragActive 
                    ? 'border-primary bg-blue-50' 
                    : 'border-gray-300 hover:border-primary'
                }`}
                onDragEnter={handleDrag}
                onDragLeave={handleDrag}
                onDragOver={handleDrag}
                onDrop={handleDrop}
              >
                <input
                  type="file"
                  accept="image/*"
                  onChange={handleImageChange}
                  className="hidden"
                  id="imageInput"
                  required
                />
                <label htmlFor="imageInput" className="cursor-pointer">
                  {imagePreview ? (
                    <div>
                      <img src={imagePreview} alt="Preview" className="max-h-48 mx-auto mb-2" />
                      <p className="text-sm text-gray-600">Click to change image</p>
                      <p className="text-xs text-gray-500 mt-1">Or drag and drop a new image</p>
                    </div>
                  ) : (
                    <div>
                      <p className="text-gray-600">📸 Click to upload or drag and drop</p>

                      <p className="text-sm text-gray-500">PNG, JPG, GIF up to 1MB</p>
                      {dragActive && (
                        <p className="text-sm text-primary font-semibold mt-2">Drop your image here</p>
                      )}
                    </div>
                  )}
                </label>
              </div>
            </div>


            {/* User Info */}
            <div>
              <label className="block text-sm font-semibold text-gray-700 mb-2">Your Name</label>
              <input
                type="text"
                name="userName"
                value={formData.userName}
                onChange={handleChange}
                placeholder="Your name"
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary focus:border-transparent"
              />
            </div>

            {/* Submit Button */}
            <button
              type="submit"
              disabled={submitting}
              className="w-full bg-primary text-white py-3 rounded-lg font-semibold hover:bg-primary-dark transition disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {submitting ? 'Submitting...' : 'Report Lost Item'}
            </button>
          </form>
        </div>
      </div>
    </div>
  )
}

