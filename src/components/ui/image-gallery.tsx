'use client'

import { useState, useEffect } from 'react'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Textarea } from '@/components/ui/textarea'
import { Badge } from '@/components/ui/badge'
import { 
  Eye, 
  Download, 
  Trash2, 
  Edit3, 
  X, 
  ZoomIn, 
  ZoomOut, 
  RotateCw,
  Calendar,
  FileImage,
  Loader2,
  Search,
  Filter,
  Grid3X3,
  List
} from 'lucide-react'
import { cn } from '@/lib/utils'
import Image from 'next/image'
import { format } from 'date-fns'
import { ptBR } from 'date-fns/locale'

interface ImageGalleryProps {
  woundId: string
  className?: string
  showUpload?: boolean
  onImageUpdate?: () => void
}

interface WoundImage {
  id: string
  url: string
  filename: string
  description?: string
  createdAt: string
}

interface ImageModalProps {
  image: WoundImage | null
  isOpen: boolean
  onClose: () => void
  onUpdate: (id: string, description: string) => void
  onDelete: (id: string) => void
}

function ImageModal({ image, isOpen, onClose, onUpdate, onDelete }: ImageModalProps) {
  const [isEditing, setIsEditing] = useState(false)
  const [description, setDescription] = useState('')
  const [zoom, setZoom] = useState(1)
  const [rotation, setRotation] = useState(0)
  const [isDeleting, setIsDeleting] = useState(false)
  const [isUpdating, setIsUpdating] = useState(false)

  useEffect(() => {
    if (image) {
      setDescription(image.description || '')
      setZoom(1)
      setRotation(0)
    }
  }, [image])

  if (!isOpen || !image) return null

  const handleUpdate = async () => {
    setIsUpdating(true)
    try {
      await onUpdate(image.id, description)
      setIsEditing(false)
    } finally {
      setIsUpdating(false)
    }
  }

  const handleDelete = async () => {
    if (!confirm('Tem certeza que deseja excluir esta imagem?')) return
    
    setIsDeleting(true)
    try {
      await onDelete(image.id)
      onClose()
    } finally {
      setIsDeleting(false)
    }
  }

  const handleDownload = () => {
    const link = document.createElement('a')
    link.href = image.url
    link.download = image.filename
    document.body.appendChild(link)
    link.click()
    document.body.removeChild(link)
  }

  return (
    <div className="fixed inset-0 bg-black bg-opacity-75 flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-lg max-w-6xl max-h-[90vh] w-full flex flex-col">
        {/* Header */}
        <div className="flex items-center justify-between p-4 border-b">
          <div>
            <h3 className="text-lg font-semibold">{image.filename}</h3>
            <p className="text-sm text-gray-500">
              {format(new Date(image.createdAt), "dd 'de' MMMM 'de' yyyy 'às' HH:mm", { locale: ptBR })}
            </p>
          </div>
          
          <div className="flex items-center space-x-2">
            <Button variant="outline" size="sm" onClick={() => setZoom(Math.max(0.5, zoom - 0.25))}>
              <ZoomOut className="h-4 w-4" />
            </Button>
            <span className="text-sm font-medium">{Math.round(zoom * 100)}%</span>
            <Button variant="outline" size="sm" onClick={() => setZoom(Math.min(3, zoom + 0.25))}>
              <ZoomIn className="h-4 w-4" />
            </Button>
            <Button variant="outline" size="sm" onClick={() => setRotation((rotation + 90) % 360)}>
              <RotateCw className="h-4 w-4" />
            </Button>
            <Button variant="outline" size="sm" onClick={handleDownload}>
              <Download className="h-4 w-4" />
            </Button>
            <Button variant="outline" size="sm" onClick={onClose}>
              <X className="h-4 w-4" />
            </Button>
          </div>
        </div>

        {/* Content */}
        <div className="flex flex-1 overflow-hidden">
          {/* Image */}
          <div className="flex-1 flex items-center justify-center p-4 overflow-auto">
            <div 
              className="transition-transform duration-200"
              style={{ 
                transform: `scale(${zoom}) rotate(${rotation}deg)`,
                transformOrigin: 'center'
              }}
            >
              <Image
                src={image.url}
                alt={image.filename}
                width={800}
                height={600}
                className="max-w-full max-h-full object-contain"
              />
            </div>
          </div>

          {/* Sidebar */}
          <div className="w-80 border-l p-4 space-y-4">
            <div>
              <div className="flex items-center justify-between mb-2">
                <Label>Descrição</Label>
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={() => setIsEditing(!isEditing)}
                >
                  <Edit3 className="h-4 w-4" />
                </Button>
              </div>
              
              {isEditing ? (
                <div className="space-y-2">
                  <Textarea
                    value={description}
                    onChange={(e) => setDescription(e.target.value)}
                    placeholder="Descreva o que mostra esta imagem..."
                    rows={4}
                  />
                  <div className="flex space-x-2">
                    <Button
                      size="sm"
                      onClick={handleUpdate}
                      disabled={isUpdating}
                    >
                      {isUpdating ? (
                        <Loader2 className="h-4 w-4 animate-spin" />
                      ) : (
                        'Salvar'
                      )}
                    </Button>
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => {
                        setIsEditing(false)
                        setDescription(image.description || '')
                      }}
                    >
                      Cancelar
                    </Button>
                  </div>
                </div>
              ) : (
                <p className="text-sm text-gray-600 bg-gray-50 p-3 rounded">
                  {description || 'Nenhuma descrição disponível'}
                </p>
              )}
            </div>

            <div className="pt-4 border-t">
              <Button
                variant="destructive"
                size="sm"
                onClick={handleDelete}
                disabled={isDeleting}
                className="w-full"
              >
                {isDeleting ? (
                  <Loader2 className="h-4 w-4 animate-spin mr-2" />
                ) : (
                  <Trash2 className="h-4 w-4 mr-2" />
                )}
                Excluir Imagem
              </Button>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}

export function ImageGallery({ woundId, className, showUpload = false, onImageUpdate }: ImageGalleryProps) {
  const [images, setImages] = useState<WoundImage[]>([])
  const [loading, setLoading] = useState(true)
  const [selectedImage, setSelectedImage] = useState<WoundImage | null>(null)
  const [isModalOpen, setIsModalOpen] = useState(false)
  const [searchTerm, setSearchTerm] = useState('')
  const [viewMode, setViewMode] = useState<'grid' | 'list'>('grid')

  const loadImages = async () => {
    try {
      const response = await fetch(`/api/images?woundId=${woundId}`)
      if (response.ok) {
        const data = await response.json()
        setImages(data.images || [])
      }
    } catch (error) {
      console.error('Erro ao carregar imagens:', error)
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    loadImages()
  }, [woundId])

  const handleImageClick = (image: WoundImage) => {
    setSelectedImage(image)
    setIsModalOpen(true)
  }

  const handleImageUpdate = async (id: string, description: string) => {
    try {
      const response = await fetch(`/api/images/${id}`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ description }),
      })

      if (response.ok) {
        setImages(prev => prev.map(img => 
          img.id === id ? { ...img, description } : img
        ))
        onImageUpdate?.()
      }
    } catch (error) {
      console.error('Erro ao atualizar imagem:', error)
    }
  }

  const handleImageDelete = async (id: string) => {
    try {
      const response = await fetch(`/api/images/${id}`, {
        method: 'DELETE',
      })

      if (response.ok) {
        setImages(prev => prev.filter(img => img.id !== id))
        onImageUpdate?.()
      }
    } catch (error) {
      console.error('Erro ao excluir imagem:', error)
    }
  }

  const filteredImages = images.filter(image =>
    image.filename.toLowerCase().includes(searchTerm.toLowerCase()) ||
    (image.description && image.description.toLowerCase().includes(searchTerm.toLowerCase()))
  )

  if (loading) {
    return (
      <Card className={className}>
        <CardContent className="p-6">
          <div className="flex items-center justify-center py-8">
            <Loader2 className="h-8 w-8 animate-spin" />
          </div>
        </CardContent>
      </Card>
    )
  }

  return (
    <>
      <Card className={className}>
        <CardHeader>
          <div className="flex items-center justify-between">
            <CardTitle className="flex items-center space-x-2">
              <FileImage className="h-5 w-5" />
              <span>Galeria de Imagens</span>
              <Badge variant="secondary">{images.length}</Badge>
            </CardTitle>
            
            <div className="flex items-center space-x-2">
              <div className="relative">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
                <Input
                  placeholder="Buscar imagens..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="pl-10 w-64"
                />
              </div>
              
              <Button
                variant="outline"
                size="sm"
                onClick={() => setViewMode(viewMode === 'grid' ? 'list' : 'grid')}
              >
                {viewMode === 'grid' ? <List className="h-4 w-4" /> : <Grid3X3 className="h-4 w-4" />}
              </Button>
            </div>
          </div>
        </CardHeader>

        <CardContent className="p-6">
          {filteredImages.length === 0 ? (
            <div className="text-center py-8">
              <FileImage className="h-12 w-12 text-gray-400 mx-auto mb-4" />
              <h3 className="text-lg font-medium text-gray-900 mb-2">
                {images.length === 0 ? 'Nenhuma imagem encontrada' : 'Nenhuma imagem corresponde à busca'}
              </h3>
              <p className="text-gray-500">
                {images.length === 0 
                  ? 'Faça upload de imagens para começar a documentar a evolução da ferida.'
                  : 'Tente ajustar os termos de busca.'
                }
              </p>
            </div>
          ) : (
            <div className={cn(
              viewMode === 'grid' 
                ? 'grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4'
                : 'space-y-4'
            )}>
              {filteredImages.map((image) => (
                <Card 
                  key={image.id} 
                  className={cn(
                    'overflow-hidden cursor-pointer hover:shadow-md transition-shadow',
                    viewMode === 'list' && 'flex'
                  )}
                  onClick={() => handleImageClick(image)}
                >
                  <div className={cn(
                    viewMode === 'grid' ? 'aspect-square' : 'w-32 h-24 flex-shrink-0'
                  )}>
                    <Image
                      src={image.url}
                      alt={image.filename}
                      width={viewMode === 'grid' ? 300 : 128}
                      height={viewMode === 'grid' ? 300 : 96}
                      className="w-full h-full object-cover"
                    />
                  </div>
                  
                  <div className={cn(
                    'p-3',
                    viewMode === 'list' && 'flex-1'
                  )}>
                    <h4 className="font-medium text-sm truncate mb-1">
                      {image.filename}
                    </h4>
                    
                    {image.description && (
                      <p className={cn(
                        'text-xs text-gray-500 mb-2',
                        viewMode === 'grid' ? 'line-clamp-2' : 'line-clamp-1'
                      )}>
                        {image.description}
                      </p>
                    )}
                    
                    <div className="flex items-center justify-between text-xs text-gray-400">
                      <span className="flex items-center">
                        <Calendar className="h-3 w-3 mr-1" />
                        {format(new Date(image.createdAt), 'dd/MM/yyyy', { locale: ptBR })}
                      </span>
                      
                      <Button
                        variant="ghost"
                        size="sm"
                        className="h-6 w-6 p-0"
                        onClick={(e) => {
                          e.stopPropagation()
                          handleImageClick(image)
                        }}
                      >
                        <Eye className="h-3 w-3" />
                      </Button>
                    </div>
                  </div>
                </Card>
              ))}
            </div>
          )}
        </CardContent>
      </Card>

      <ImageModal
        image={selectedImage}
        isOpen={isModalOpen}
        onClose={() => {
          setIsModalOpen(false)
          setSelectedImage(null)
        }}
        onUpdate={handleImageUpdate}
        onDelete={handleImageDelete}
      />
    </>
  )
}