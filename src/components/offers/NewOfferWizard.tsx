'use client'

import { useState, useCallback } from 'react'
import { useRouter } from 'next/navigation'
import { useDropzone } from 'react-dropzone'
import {
  Upload, FileText, ClipboardPaste, PenLine,
  Loader2, CheckCircle, AlertCircle, ChevronRight,
  ChevronLeft, Sparkles, X, File
} from 'lucide-react'
import { cn, formatFileSize } from '@/lib/utils'
import { createClient } from '@/lib/supabase'
import PropertyDetailsForm from './PropertyDetailsForm'
import CostBreakdownForm from './CostBreakdownForm'
import TemplateSelector from './TemplateSelector'
import ReviewScreen from './ReviewScreen'
import type {
  Agent, Developer, Community, InputMethod,
  ExtractedPropertyData, OfferFormData, PDFTemplate
} from '@/types'

type Step = 'input' | 'details' | 'costs' | 'template' | 'review'

const STEPS: { id: Step; label: string }[] = [
  { id: 'input',    label: 'Input' },
  { id: 'details',  label: 'Details' },
  { id: 'costs',    label: 'Costs' },
  { id: 'template', label: 'Template' },
  { id: 'review',   label: 'Review' },
]

interface NewOfferWizardProps {
  agent: Agent
  developers: Developer[]
  communities: Community[]
}

export default function NewOfferWizard({
  agent, developers, communities
}: NewOfferWizardProps) {
  const router = useRouter()
  const supabase = createClient()

  const [step, setStep] = useState<Step>('input')
  const [inputMethod, setInputMethod] = useState<InputMethod | null>(null)
  const [pastedText, setPastedText] = useState('')
  const [uploadedFile, setUploadedFile] = useState<File | null>(null)
  const [extracting, setExtracting] = useState(false)
  const [extractionError, setExtractionError] = useState<string | null>(null)
  const [extracted, setExtracted] = useState<ExtractedPropertyData | null>(null)
  const [sourceDocumentId, setSourceDocumentId] = useState<string | null>(null)
  const [formData, setFormData] = useState<Partial<OfferFormData>>({})
  const [generating, setGenerating] = useState(false)

  // ── Dropzone ──
  const onDrop = useCallback((acceptedFiles: File[]) => {
    const file = acceptedFiles[0]
    if (!file) return
    setUploadedFile(file)
    setInputMethod(file.type === 'application/pdf' ? 'pdf_upload' : 'image_upload')
    setExtractionError(null)
  }, [])

  const { getRootProps, getInputProps, isDragActive } = useDropzone({
    onDrop,
    accept: {
      'application/pdf': ['.pdf'],
      'image/*': ['.jpg', '.jpeg', '.png', '.webp', '.heic'],
    },
    maxFiles: 1,
    maxSize: 20 * 1024 * 1024, // 20MB
  })

  // ── Run AI extraction ──
  async function runExtraction() {
    if (!inputMethod) return
    setExtracting(true)
    setExtractionError(null)

    try {
      const formPayload = new FormData()
      formPayload.append('input_method', inputMethod)
      if (uploadedFile) formPayload.append('file', uploadedFile)
      if (pastedText) formPayload.append('text', pastedText)

      const response = await fetch('/api/extract', {
        method: 'POST',
        body: formPayload,
      })

      const result = await response.json()

      if (!response.ok) {
        throw new Error(result.error || 'Extraction failed')
      }

      setExtracted(result.data)
      setSourceDocumentId(result.source_document_id)

      // Pre-fill form with extracted data
      setFormData(prev => ({
        ...prev,
        input_method: inputMethod,
        source_document_id: result.source_document_id,
        developer_name: result.data.developer_name || '',
        community_name: result.data.community_name || '',
        project_name: result.data.project_name || '',
        unit_reference: result.data.unit_reference || '',
        unit_type_label: result.data.unit_type_label || '',
        bedrooms: result.data.bedrooms || '',
        bathrooms: result.data.bathrooms || '',
        bua_sqft: result.data.bua_sqft?.toString() || '',
        plot_sqft: result.data.plot_sqft?.toString() || '',
        asking_price_aed: result.data.asking_price_aed?.toString() || '',
        completion_date_label: result.data.completion_date_label || '',
        completion_date: result.data.completion_date || '',
        view_description: result.data.view_description || '',
      }))

      setStep('details')
    } catch (err: any) {
      setExtractionError(err.message || 'Failed to extract data. Please try again or enter manually.')
    } finally {
      setExtracting(false)
    }
  }

  function goToStep(s: Step) {
    setStep(s)
    window.scrollTo({ top: 0, behavior: 'smooth' })
  }

  const stepIndex = STEPS.findIndex(s => s.id === step)

  return (
    <div className="max-w-3xl">

      {/* ── Step indicator ── */}
      <div className="flex items-center mb-8">
        {STEPS.map((s, i) => (
          <div key={s.id} className="flex items-center">
            <div className={cn(
              'step-dot',
              i < stepIndex  ? 'step-dot-complete' :
              i === stepIndex ? 'step-dot-active' :
              'step-dot-pending'
            )}>
              {i < stepIndex ? (
                <CheckCircle className="w-3.5 h-3.5" />
              ) : (
                <span>{i + 1}</span>
              )}
            </div>
            <span className={cn(
              'text-xs ml-1.5',
              i === stepIndex ? 'text-dark-700 font-medium' : 'text-dark-400'
            )}>
              {s.label}
            </span>
            {i < STEPS.length - 1 && (
              <div className={cn(
                'step-line mx-3',
                i < stepIndex ? 'step-line-complete' : ''
              )} />
            )}
          </div>
        ))}
      </div>

      {/* ── STEP 1: Input method ── */}
      {step === 'input' && (
        <div className="space-y-6 animate-slide-up">
          <div>
            <h2 className="text-base font-medium text-dark-800 mb-1">
              How would you like to add the property details?
            </h2>
            <p className="text-sm text-dark-400">
              Upload a developer PDF or image, paste text, or fill in manually.
            </p>
          </div>

          {/* ── Upload zone ── */}
          <div
            {...getRootProps()}
            className={cn(
              'border-2 border-dashed rounded-xl p-8 text-center cursor-pointer transition-colors duration-150',
              isDragActive
                ? 'border-gold-400 bg-gold-50'
                : uploadedFile
                ? 'border-green-400 bg-green-50'
                : 'border-dark-200 hover:border-gold-300 hover:bg-gold-50'
            )}
          >
            <input {...getInputProps()} />

            {uploadedFile ? (
              <div className="flex flex-col items-center gap-3">
                <div className="w-12 h-12 rounded-full bg-green-100 flex items-center justify-center">
                  <File className="w-6 h-6 text-green-600" />
                </div>
                <div>
                  <p className="text-sm font-medium text-dark-800">{uploadedFile.name}</p>
                  <p className="text-xs text-dark-400">{formatFileSize(uploadedFile.size)}</p>
                </div>
                <button
                  type="button"
                  onClick={e => { e.stopPropagation(); setUploadedFile(null); setInputMethod(null) }}
                  className="text-xs text-red-500 hover:underline flex items-center gap-1"
                >
                  <X className="w-3 h-3" /> Remove
                </button>
              </div>
            ) : (
              <div className="flex flex-col items-center gap-3">
                <div className="w-12 h-12 rounded-full bg-dark-100 flex items-center justify-center">
                  <Upload className="w-6 h-6 text-dark-400" />
                </div>
                <div>
                  <p className="text-sm font-medium text-dark-600">
                    {isDragActive ? 'Drop it here' : 'Upload PDF, image, or screenshot'}
                  </p>
                  <p className="text-xs text-dark-400 mt-0.5">
                    PDF, JPG, PNG, WEBP, HEIC · Max 20MB
                  </p>
                </div>
              </div>
            )}
          </div>

          {/* ── Paste text ── */}
          <div className="card p-5">
            <div className="flex items-center gap-2 mb-3">
              <ClipboardPaste className="w-4 h-4 text-dark-400" />
              <p className="text-sm font-medium text-dark-700">Paste text</p>
              <span className="badge-gray text-xs">WhatsApp / Email</span>
            </div>
            <textarea
              value={pastedText}
              onChange={e => {
                setPastedText(e.target.value)
                if (e.target.value) setInputMethod('text_paste')
                else if (!uploadedFile) setInputMethod(null)
              }}
              placeholder="Paste property details from WhatsApp, email, or any text source..."
              className="w-full h-28 text-sm resize-none"
            />
          </div>

          {/* ── Manual entry option ── */}
          <button
            type="button"
            onClick={() => {
              setInputMethod('manual')
              setFormData(prev => ({ ...prev, input_method: 'manual' }))
              goToStep('details')
            }}
            className="w-full flex items-center justify-between p-4 rounded-xl
                       border border-dark-200 hover:border-gold-300 hover:bg-gold-50
                       text-sm text-dark-600 hover:text-dark-800 transition-colors duration-150"
          >
            <div className="flex items-center gap-3">
              <PenLine className="w-4 h-4 text-dark-400" />
              <div className="text-left">
                <p className="font-medium">Enter details manually</p>
                <p className="text-xs text-dark-400">Fill in the form field by field</p>
              </div>
            </div>
            <ChevronRight className="w-4 h-4 text-dark-400" />
          </button>

          {/* Extraction error */}
          {extractionError && (
            <div className="flex items-start gap-2.5 rounded-lg bg-red-50 border border-red-200 px-4 py-3">
              <AlertCircle className="w-4 h-4 text-red-500 mt-0.5 shrink-0" />
              <div>
                <p className="text-sm text-red-600">{extractionError}</p>
                <button
                  onClick={() => {
                    setInputMethod('manual')
                    setFormData(prev => ({ ...prev, input_method: 'manual' }))
                    goToStep('details')
                  }}
                  className="text-xs text-red-500 underline mt-1"
                >
                  Enter manually instead
                </button>
              </div>
            </div>
          )}

          {/* Extract button */}
          {(uploadedFile || pastedText) && (
            <button
              onClick={runExtraction}
              disabled={extracting}
              className="btn-primary w-full btn-lg"
            >
              {extracting ? (
                <><Loader2 className="w-4 h-4 animate-spin" /> Extracting details...</>
              ) : (
                <><Sparkles className="w-4 h-4" /> Extract property details with AI</>
              )}
            </button>
          )}
        </div>
      )}

      {/* ── STEP 2: Property details ── */}
      {step === 'details' && (
        <PropertyDetailsForm
          initialData={formData}
          extracted={extracted}
          developers={developers}
          communities={communities}
          onBack={() => goToStep('input')}
          onNext={(data) => {
            setFormData(prev => ({ ...prev, ...data }))
            goToStep('costs')
          }}
        />
      )}

      {/* ── STEP 3: Cost breakdown ── */}
      {step === 'costs' && (
        <CostBreakdownForm
          formData={formData}
          onBack={() => goToStep('details')}
          onNext={(data) => {
            setFormData(prev => ({ ...prev, ...data }))
            goToStep('template')
          }}
        />
      )}

      {/* ── STEP 4: Template selection ── */}
      {step === 'template' && (
        <TemplateSelector
          onBack={() => goToStep('costs')}
          onNext={(template) => {
            setFormData(prev => ({ ...prev, template }))
            goToStep('review')
          }}
        />
      )}

      {/* ── STEP 5: Review ── */}
      {step === 'review' && (
        <ReviewScreen
          formData={formData as OfferFormData}
          agent={agent}
          onBack={() => goToStep('template')}
          onImagesUpdate={(imgs) => {
            setFormData(prev => ({
              ...prev,
              image_hero:       imgs.hero       || undefined,
              image_lifestyle:  imgs.lifestyle  || undefined,
              image_map:        imgs.map        || undefined,
              image_masterplan: imgs.masterplan || undefined,
            }))
          }}
          onGenerate={async () => {
            setGenerating(true)
            try {
              const response = await fetch('/api/offers', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify(formData),
              })
              const result = await response.json()
              if (!response.ok) throw new Error(result.error)
              router.push(`/offers/${result.data.id}`)
            } catch (err: any) {
              alert('Failed to generate offer: ' + err.message)
              setGenerating(false)
            }
          }}
          generating={generating}
        />
      )}
    </div>
  )
}
