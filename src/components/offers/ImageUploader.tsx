'use client'

import { useState, useCallback } from 'react'
import { useDropzone } from 'react-dropzone'
import { Upload, X, CheckCircle, Loader2, ImageIcon } from 'lucide-react'
import { cn, formatFileSize } from '@/lib/utils'

type ImageType = 'hero' | 'lifestyle' | 'map' | 'masterplan'

interface ImageSlot {
  type:    ImageType
  label:   string
  hint:    string
  required: boolean
}

const IMAGE_SLOTS: ImageSlot[] = [
  { type: 'hero',       label: 'Hero image',         hint: 'Main property exterior — shown on cover', required: true  },
  { type: 'lifestyle',  label: 'Lifestyle / community', hint: 'Community amenity or lifestyle shot',  required: false },
  { type: 'map',        label: 'Community map',       hint: 'Location or master plan map',            required: false },
  { type: 'masterplan', label: 'Site / floor plan',   hint: 'Unit floor plan or site cluster plan',   required: false },
]

interface ImageUploaderProps {
  offerId?:  string
  onImagesChange: (images: Record<ImageType, string>) => void
  initialImages?: Record<ImageType, string>
}

export default function ImageUploader({ offerId, onImagesChange, initialImages = {} as Record<ImageType, string> }: ImageUploaderProps) {
  const [images, setImages] = useState<Record<ImageType, string>>(initialImages)
  const [uploading, setUploading] = useState<Record<ImageType, boolean>>({} as Record<ImageType, boolean>)
  const [errors, setErrors]       = useState<Record<ImageType, string>>({} as Record<ImageType, string>)

  async function uploadImage(type: ImageType, file: File) {
    setUploading(prev => ({ ...prev, [type]: true }))
    setErrors(prev => ({ ...prev, [type]: '' }))

    const form = new FormData()
    form.append('file', file)
    form.append('image_type', type)
    if (offerId) form.append('offer_id', offerId)

    try {
      const res = await fetch('/api/images', { method: 'POST', body: form })
      const data = await res.json()
      if (!res.ok) throw new Error(data.error)

      const updated = { ...images, [type]: data.url }
      setImages(updated)
      onImagesChange(updated)
    } catch (err: any) {
      setErrors(prev => ({ ...prev, [type]: err.message }))
    } finally {
      setUploading(prev => ({ ...prev, [type]: false }))
    }
  }

  function removeImage(type: ImageType) {
    const updated = { ...images }
    delete updated[type]
    setImages(updated)
    onImagesChange(updated)
  }

  return (
    <div className="space-y-3">
      <div className="flex items-center justify-between">
        <div>
          <p className="text-sm font-medium text-dark-700">Property images</p>
          <p className="text-xs text-dark-400">Images appear in the PDF. Hero image is required.</p>
        </div>
        <span className={cn('badge', Object.keys(images).length > 0 ? 'badge-green' : 'badge-gray')}>
          {Object.keys(images).length} / 4 uploaded
        </span>
      </div>

      <div className="grid grid-cols-2 gap-3">
        {IMAGE_SLOTS.map(slot => (
          <ImageSlotUploader
            key={slot.type}
            slot={slot}
            url={images[slot.type]}
            uploading={uploading[slot.type] || false}
            error={errors[slot.type] || ''}
            onUpload={file => uploadImage(slot.type, file)}
            onRemove={() => removeImage(slot.type)}
          />
        ))}
      </div>

      {!images.hero && (
        <p className="text-xs text-amber-600 flex items-center gap-1">
          <span>⚠</span> Hero image required — PDF cover will show a placeholder without it
        </p>
      )}
    </div>
  )
}

function ImageSlotUploader({
  slot, url, uploading, error, onUpload, onRemove
}: {
  slot: ImageSlot
  url: string | undefined
  uploading: boolean
  error: string
  onUpload: (file: File) => void
  onRemove: () => void
}) {
  const onDrop = useCallback((files: File[]) => {
    if (files[0]) onUpload(files[0])
  }, [onUpload])

  const { getRootProps, getInputProps, isDragActive } = useDropzone({
    onDrop,
    accept: { 'image/*': ['.jpg', '.jpeg', '.png', '.webp', '.heic'] },
    maxFiles: 1,
    maxSize: 20 * 1024 * 1024,
    disabled: uploading,
  })

  if (url) {
    return (
      <div className="relative rounded-xl overflow-hidden border border-green-200 bg-green-50">
        <img src={url} alt={slot.label} className="w-full h-28 object-cover" />
        <div className="absolute inset-0 bg-dark-900/30 flex flex-col justify-between p-2">
          <div className="flex items-center justify-between">
            <span className="text-xs font-medium text-white bg-dark-800/70 rounded px-1.5 py-0.5">
              {slot.label}
            </span>
            <button onClick={onRemove}
              className="w-6 h-6 rounded-full bg-red-500 flex items-center justify-center">
              <X className="w-3 h-3 text-white" />
            </button>
          </div>
          <div className="flex items-center gap-1">
            <CheckCircle className="w-3.5 h-3.5 text-green-400" />
            <span className="text-xs text-green-300">Uploaded</span>
          </div>
        </div>
      </div>
    )
  }

  return (
    <div>
      <div
        {...getRootProps()}
        className={cn(
          'rounded-xl border-2 border-dashed h-28 flex flex-col items-center justify-center',
          'cursor-pointer transition-colors duration-150 p-3 text-center',
          isDragActive ? 'border-gold-400 bg-gold-50' :
          uploading    ? 'border-dark-200 bg-dark-50' :
          slot.required ? 'border-amber-300 bg-amber-50 hover:border-gold-400 hover:bg-gold-50' :
                          'border-dark-200 bg-dark-50 hover:border-gold-300 hover:bg-gold-50'
        )}
      >
        <input {...getInputProps()} />
        {uploading ? (
          <Loader2 className="w-5 h-5 text-dark-400 animate-spin mb-1" />
        ) : (
          <ImageIcon className={cn('w-5 h-5 mb-1',
            slot.required ? 'text-amber-500' : 'text-dark-400')} />
        )}
        <p className={cn('text-xs font-medium',
          slot.required ? 'text-amber-700' : 'text-dark-600')}>
          {uploading ? 'Uploading...' : slot.label}
          {slot.required && !uploading && ' *'}
        </p>
        {!uploading && (
          <p className="text-xs text-dark-400 mt-0.5">{slot.hint}</p>
        )}
      </div>
      {error && <p className="text-xs text-red-500 mt-1">{error}</p>}
    </div>
  )
}
