'use client'

import React, { useState, useRef, useEffect } from 'react'
import Image from 'next/image'

interface LazyImageProps {
  src: string
  alt: string
  width?: number
  height?: number
  className?: string
  onClick?: () => void
  priority?: boolean
  placeholder?: string
}

export const LazyImage: React.FC<LazyImageProps> = ({
  src,
  alt,
  width = 200,
  height = 200,
  className = '',
  onClick,
  priority = false,
  placeholder = 'data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iMjAwIiBoZWlnaHQ9IjIwMCIgeG1sbnM9Imh0dHA6Ly93d3cudzMub3JnLzIwMDAvc3ZnIj48cmVjdCB3aWR0aD0iMTAwJSIgaGVpZ2h0PSIxMDAlIiBmaWxsPSIjZjNmNGY2Ii8+PHRleHQgeD0iNTAlIiB5PSI1MCUiIGZvbnQtZmFtaWx5PSJBcmlhbCwgc2Fucy1zZXJpZiIgZm9udC1zaXplPSIxNCIgZmlsbD0iIzk5YTNhZiIgdGV4dC1hbmNob3I9Im1pZGRsZSIgZHk9Ii4zZW0iPkNhcnJlZ2FuZG8uLi48L3RleHQ+PC9zdmc+'
}) => {
  const [isLoaded, setIsLoaded] = useState(false)
  const [isInView, setIsInView] = useState(false)
  const [hasError, setHasError] = useState(false)
  const imgRef = useRef<HTMLDivElement>(null)

  useEffect(() => {
    const observer = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting) {
          setIsInView(true)
          observer.disconnect()
        }
      },
      {
        threshold: 0.1,
        rootMargin: '50px'
      }
    )

    if (imgRef.current) {
      observer.observe(imgRef.current)
    }

    return () => observer.disconnect()
  }, [])

  const handleLoad = () => {
    setIsLoaded(true)
  }

  const handleError = () => {
    setHasError(true)
    setIsLoaded(true)
  }

  return (
    <div 
      ref={imgRef}
      className={`relative overflow-hidden bg-gray-100 ${className}`}
      style={{ width, height }}
      onClick={onClick}
    >
      {!isInView && !priority ? (
        <div 
          className="w-full h-full flex items-center justify-center bg-gray-100"
          style={{ 
            backgroundImage: `url("${placeholder}")`,
            backgroundSize: 'cover',
            backgroundPosition: 'center'
          }}
        />
      ) : (
        <>
          {!isLoaded && (
            <div 
              className="absolute inset-0 flex items-center justify-center bg-gray-100 animate-pulse"
              style={{ 
                backgroundImage: `url("${placeholder}")`,
                backgroundSize: 'cover',
                backgroundPosition: 'center'
              }}
            />
          )}
          {hasError ? (
            <div className="absolute inset-0 flex items-center justify-center bg-gray-200 text-gray-500 text-sm">
              <div className="text-center">
                <div className="mb-2">⚠️</div>
                <div>Erro ao carregar</div>
              </div>
            </div>
          ) : (
            <Image
              src={src}
              alt={alt}
              width={width}
              height={height}
              className={`transition-opacity duration-300 ${
                isLoaded ? 'opacity-100' : 'opacity-0'
              }`}
              onLoad={handleLoad}
              onError={handleError}
              priority={priority}
              style={{
                objectFit: 'cover',
                width: '100%',
                height: '100%'
              }}
            />
          )}
        </>
      )}
    </div>
  )
}

export default LazyImage