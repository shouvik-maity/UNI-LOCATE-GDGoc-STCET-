'use client'


import { useState, useEffect, useRef } from 'react'

interface ImageWithFallbackProps {
  src: string
  alt: string
  className?: string
  fallbackClassName?: string
  maxSize?: number // Maximum file size in characters for base64
  showRetry?: boolean
  onRetry?: () => void
}

export default function ImageWithFallback({
  src,
  alt,
  className = '',
  fallbackClassName = '',
  maxSize = 500000, // 500KB default limit for base64
  showRetry = true,
  onRetry
}: ImageWithFallbackProps) {
  const [imageError, setImageError] = useState(false)
  const [imageLoaded, setImageLoaded] = useState(false)
  const [isValidImage, setIsValidImage] = useState(false)
  const imageRef = useRef<HTMLImageElement>(null)
  const loadTimeoutRef = useRef<NodeJS.Timeout>()

  // Reset states when src changes
  useEffect(() => {
    setImageError(false)
    setImageLoaded(false)
    setIsValidImage(false)
    
    // Clear any existing timeout
    if (loadTimeoutRef.current) {
      clearTimeout(loadTimeoutRef.current)
    }

    // Validate image source
    const validImage = src && 
                      typeof src === 'string' && 
                      src.startsWith('data:image/') && 
                      src.length > 0 && 
                      src.length < maxSize &&
                      !src.includes('null') &&
                      !src.includes('undefined')
    
    setIsValidImage(!!validImage)

    // Set a timeout for loading
    if (validImage) {
      loadTimeoutRef.current = setTimeout(() => {
        if (!imageLoaded) {
          setImageError(true)
        }
      }, 10000) // 10 second timeout
    }

    return () => {
      if (loadTimeoutRef.current) {
        clearTimeout(loadTimeoutRef.current)
      }
    }
  }, [src, maxSize])

  const handleError = () => {
    console.warn('Image failed to load:', { src: src?.substring(0, 100) + '...', alt })
    setImageError(true)
    setImageLoaded(false)
    
    if (loadTimeoutRef.current) {
      clearTimeout(loadTimeoutRef.current)
    }
  }

  const handleLoad = () => {
    setImageLoaded(true)
    setImageError(false)
    
    if (loadTimeoutRef.current) {
      clearTimeout(loadTimeoutRef.current)
    }
  }

  const handleRetry = () => {
    setImageError(false)
    setImageLoaded(false)
    
    // Force re-render by changing src slightly
    if (imageRef.current) {
      const currentSrc = imageRef.current.src
      imageRef.current.src = ''
      setTimeout(() => {
        if (imageRef.current) {
          imageRef.current.src = currentSrc
        }
      }, 100)
    }
    
    if (onRetry) {
      onRetry()
    }
  }

  // Determine error reason
  const getErrorReason = () => {
    if (!src) return 'No image source provided'
    if (!src.startsWith('data:image/')) return 'Invalid image format'
    if (src.length >= maxSize) return 'Image too large'
    if (src.includes('null') || src.includes('undefined')) return 'Invalid image data'
    return 'Failed to load image'
  }

  // Show placeholder when no valid image or error occurred
  if (!isValidImage || imageError) {
    return (
      <div className={`flex items-center justify-center ${fallbackClassName}`}>
        <div className="text-gray-500 text-center p-4">
          <div className="text-4xl mb-2">📷</div>
          <p className="text-sm">No image available</p>
          <p className="text-xs text-gray-400 mt-1">{getErrorReason()}</p>
          {src && src.length > 0 && (
            <p className="text-xs text-gray-400 mt-1">
              Size: {Math.round(src.length / 1024)}KB / {Math.round(maxSize / 1024)}KB max
            </p>
          )}
          {showRetry && (imageError || !isValidImage) && (
            <button
              onClick={handleRetry}
              className="text-xs text-blue-500 hover:text-blue-700 mt-2 underline"
            >
              Try again
            </button>
          )}
        </div>
      </div>
    )
  }

  return (
    <div className="relative">
      <img
        ref={imageRef}
        src={src}
        alt={alt}
        className={`${className} ${!imageLoaded ? 'opacity-0' : 'opacity-100'} transition-opacity duration-300`}
        onError={handleError}
        onLoad={handleLoad}
        loading="lazy"
        style={{ 
          opacity: imageLoaded ? 1 : 0,
          transition: 'opacity 0.3s ease-in-out'
        }}
      />
      
      {/* Loading indicator */}
      {!imageLoaded && !imageError && (
        <div className="absolute inset-0 flex items-center justify-center bg-gray-100">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
        </div>
      )}
      
      {/* Retry button for failed images */}
      {imageError && showRetry && (
        <div className="absolute inset-0 flex items-center justify-center bg-gray-100 bg-opacity-75">
          <button
            onClick={handleRetry}
            className="bg-primary text-white px-4 py-2 rounded-lg font-semibold hover:bg-primary-dark transition"
          >
            🔄 Retry
          </button>
        </div>
      )}
    </div>
  )
}
