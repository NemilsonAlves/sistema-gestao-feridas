'use client'

import { useState, useRef, useCallback } from 'react'
import { Button } from '@/components/ui/button'
import { Card, CardContent } from '@/components/ui/card'
import { Label } from '@/components/ui/label'
import { Textarea } from '@/components/ui/textarea'
import { Badge } from '@/components/ui/badge'
import { 
  Upload, 
  X, 
  Camera, 
  FileImage,
  Loader2
} from 'lucide-react'
import { cn } from '@/lib/utils'
import Image from 'next/image'

interface ImageUploadProps {
  woundId: string
  onUploadComplete?: (images: WoundImage[]) => void
  maxFiles?: number
  maxSize?: number // em MB
  acceptedTypes?: string[]
  className?: string
}

interface WoundImage {
  id: string
  url: string
  filename: string
  description?: string
  createdAt: string
}

interface UploadingFile {
  file: File
  preview: string
  description: string
  progress: number
  error?: string
}

export function ImageUpload({
  woundId,
  onUploadComplete,
  maxFiles = 10,
  maxSize = 5, // 5MB
  acceptedTypes = ['image/jpeg', 'image/png', 'image/webp'],
  className
}: ImageUploadProps) {
  const [uploadingFiles, setUploadingFiles] = useState<UploadingFile[]>([])
  const [isUploading, setIsUploading] = useState(false)
  const fileInputRef = useRef<HTMLInputElement>(null)

  const validateFile = useCallback((file: File): string | null => {
    if (!acceptedTypes.includes(file.type)) {
      return `Tipo de arquivo não suportado. Use: ${acceptedTypes.join(', ')}`
    }
    
    if (file.size > maxSize * 1024 * 1024) {
      return `Arquivo muito grande. Máximo: ${maxSize}MB`
    }
    
    return null
  }, [acceptedTypes, maxSize])

  const handleFileSelect = useCallback((files: FileList | null) => {
    if (!files) return

    const newFiles: UploadingFile[] = []
    
    for (let i = 0; i < files.length; i++) {
      const file = files[i]
      const error = validateFile(file)
      
      if (uploadingFiles.length + newFiles.length >= maxFiles) {
        break
      }
      
      const preview = URL.createObjectURL(file)
      
      newFiles.push({
        file,
        preview,
        description: '',
        progress: 0,
        error: error || undefined
      })
    }
    
    setUploadingFiles(prev => [...prev, ...newFiles])
  }, [uploadingFiles.length, maxFiles, validateFile])

  const handleDrop = useCallback((e: React.DragEvent) => {
    e.preventDefault()
    handleFileSelect(e.dataTransfer.files)
  }, [handleFileSelect])

  const handleDragOver = useCallback((e: React.DragEvent) => {
    e.preventDefault()
  }, [])

  const removeFile = (index: number) => {
    setUploadingFiles(prev => {
      const newFiles = [...prev]
      URL.revokeObjectURL(newFiles[index].preview)
      newFiles.splice(index, 1)
      return newFiles
    })
  }

  const updateDescription = (index: number, description: string) => {
    setUploadingFiles(prev => {
      const newFiles = [...prev]
      newFiles[index].description = description
      return newFiles
    })
  }

  const uploadFile = async (uploadingFile: UploadingFile, index: number): Promise<WoundImage | null> => {
    const formData = new FormData()
    formData.append('file', uploadingFile.file)
    formData.append('woundId', woundId)
    formData.append('description', uploadingFile.description)

    try {
      const response = await fetch('/api/images', {
        method: 'POST',
        body: formData,
      })

      if (!response.ok) {
        const error = await response.json()
        throw new Error(error.message || 'Erro no upload')
      }

      const result = await response.json()
      return result.image
    } catch (error) {
      setUploadingFiles(prev => {
        const newFiles = [...prev]
        newFiles[index].error = error instanceof Error ? error.message : 'Erro no upload'
        return newFiles
      })
      return null
    }
  }

  const handleUpload = async () => {
    const validFiles = uploadingFiles.filter(f => !f.error)
    if (validFiles.length === 0) return

    setIsUploading(true)
    const uploadedImages: WoundImage[] = []

    try {
      for (let i = 0; i < validFiles.length; i++) {
        const fileIndex = uploadingFiles.findIndex(f => f === validFiles[i])
        
        // Simular progresso
        const progressInterval = setInterval(() => {
          setUploadingFiles(prev => {
            const newFiles = [...prev]
            if (newFiles[fileIndex]) {
              newFiles[fileIndex].progress = Math.min(newFiles[fileIndex].progress + 10, 90)
            }
            return newFiles
          })
        }, 100)

        const uploadedImage = await uploadFile(validFiles[i], fileIndex)
        
        clearInterval(progressInterval)
        
        if (uploadedImage) {
          uploadedImages.push(uploadedImage)
          
          // Completar progresso
          setUploadingFiles(prev => {
            const newFiles = [...prev]
            if (newFiles[fileIndex]) {
              newFiles[fileIndex].progress = 100
            }
            return newFiles
          })
        }
      }

      // Limpar arquivos enviados com sucesso
      setTimeout(() => {
        setUploadingFiles(prev => prev.filter(f => f.error || f.progress < 100))
        onUploadComplete?.(uploadedImages)
      }, 1000)

    } finally {
      setIsUploading(false)
    }
  }

  const openCamera = () => {
    if (fileInputRef.current) {
      fileInputRef.current.setAttribute('capture', 'environment')
      fileInputRef.current.click()
    }
  }

  const openFileSelector = () => {
    if (fileInputRef.current) {
      fileInputRef.current.removeAttribute('capture')
      fileInputRef.current.click()
    }
  }

  return (
    <div className={cn('space-y-4', className)}>
      {/* Área de Upload */}
      <Card>
        <CardContent className="p-6">
          <div
            className="border-2 border-dashed border-gray-300 rounded-lg p-8 text-center hover:border-gray-400 transition-colors"
            onDrop={handleDrop}
            onDragOver={handleDragOver}
          >
            <div className="flex flex-col items-center space-y-4">
              <div className="flex space-x-2">
                <Button
                  type="button"
                  variant="outline"
                  onClick={openFileSelector}
                  className="flex items-center space-x-2"
                >
                  <FileImage className="h-4 w-4" />
                  <span>Selecionar Arquivos</span>
                </Button>
                
                <Button
                  type="button"
                  variant="outline"
                  onClick={openCamera}
                  className="flex items-center space-x-2"
                >
                  <Camera className="h-4 w-4" />
                  <span>Câmera</span>
                </Button>
              </div>
              
              <div className="text-sm text-gray-500">
                <p>Ou arraste e solte imagens aqui</p>
                <p>Máximo {maxFiles} arquivos, {maxSize}MB cada</p>
                <p>Formatos: JPEG, PNG, WebP</p>
              </div>
            </div>
          </div>

          <input
            ref={fileInputRef}
            type="file"
            multiple
            accept={acceptedTypes.join(',')}
            onChange={(e) => handleFileSelect(e.target.files)}
            className="hidden"
          />
        </CardContent>
      </Card>

      {/* Preview dos Arquivos */}
      {uploadingFiles.length > 0 && (
        <Card>
          <CardContent className="p-6">
            <div className="space-y-4">
              <div className="flex items-center justify-between">
                <h3 className="text-lg font-medium">Imagens Selecionadas</h3>
                <Badge variant="secondary">
                  {uploadingFiles.length} arquivo(s)
                </Badge>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {uploadingFiles.map((uploadingFile, index) => (
                  <Card key={index} className="overflow-hidden">
                    <div className="relative">
                      <Image
                        src={uploadingFile.preview}
                        alt={`Preview ${index + 1}`}
                        width={300}
                        height={200}
                        className="w-full h-48 object-cover"
                      />
                      
                      <Button
                        type="button"
                        variant="destructive"
                        size="sm"
                        className="absolute top-2 right-2"
                        onClick={() => removeFile(index)}
                      >
                        <X className="h-4 w-4" />
                      </Button>

                      {uploadingFile.progress > 0 && (
                        <div className="absolute bottom-0 left-0 right-0 bg-black bg-opacity-50 p-2">
                          <div className="w-full bg-gray-200 rounded-full h-2">
                            <div
                              className="bg-blue-600 h-2 rounded-full transition-all duration-300"
                              style={{ width: `${uploadingFile.progress}%` }}
                            />
                          </div>
                        </div>
                      )}
                    </div>

                    <CardContent className="p-4 space-y-3">
                      <div>
                        <Label htmlFor={`description-${index}`}>
                          Descrição da Imagem
                        </Label>
                        <Textarea
                          id={`description-${index}`}
                          placeholder="Descreva o que mostra esta imagem..."
                          value={uploadingFile.description}
                          onChange={(e) => updateDescription(index, e.target.value)}
                          rows={2}
                        />
                      </div>

                      <div className="flex items-center justify-between text-sm text-gray-500">
                        <span>{uploadingFile.file.name}</span>
                        <span>{(uploadingFile.file.size / 1024 / 1024).toFixed(2)} MB</span>
                      </div>

                      {uploadingFile.error && (
                        <div className="text-sm text-red-600 bg-red-50 p-2 rounded">
                          {uploadingFile.error}
                        </div>
                      )}
                    </CardContent>
                  </Card>
                ))}
              </div>

              <div className="flex justify-end space-x-2">
                <Button
                  type="button"
                  variant="outline"
                  onClick={() => setUploadingFiles([])}
                  disabled={isUploading}
                >
                  Limpar Tudo
                </Button>
                
                <Button
                  type="button"
                  onClick={handleUpload}
                  disabled={isUploading || uploadingFiles.filter(f => !f.error).length === 0}
                  className="flex items-center space-x-2"
                >
                  {isUploading ? (
                    <Loader2 className="h-4 w-4 animate-spin" />
                  ) : (
                    <Upload className="h-4 w-4" />
                  )}
                  <span>
                    {isUploading ? 'Enviando...' : 'Enviar Imagens'}
                  </span>
                </Button>
              </div>
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  )
}