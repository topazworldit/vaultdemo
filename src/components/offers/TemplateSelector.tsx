'use client'

import { useState } from 'react'
import { ChevronLeft, ChevronRight, Smartphone, Monitor, Presentation } from 'lucide-react'
import { cn } from '@/lib/utils'
import { TEMPLATE_OPTIONS } from '@/types'
import type { PDFTemplate } from '@/types'

interface TemplateSelectorProps {
  onBack:   () => void
  onNext:   (template: PDFTemplate) => void
}

export default function TemplateSelector({ onBack, onNext }: TemplateSelectorProps) {
  const [selected, setSelected] = useState<PDFTemplate>('T1_portrait')

  const ICONS = {
    T1_portrait:  Smartphone,
    T2_editorial: Monitor,
    T3_landscape: Presentation,
  }

  const PREVIEWS = {
    T1_portrait: {
      bg: '#1C1C1A',
      accent: '#B8975A',
      description: 'Dark luxury style. Portrait orientation. Designed for mobile viewing — client scrolls naturally on their phone.',
    },
    T2_editorial: {
      bg: '#FAFAF8',
      accent: '#B8975A',
      description: 'Clean white editorial style. Portrait orientation. Professional feel for email or print. Best for formal presentations.',
    },
    T3_landscape: {
      bg: '#2A2826',
      accent: '#B8975A',
      description: 'Pitch deck style. Landscape orientation. Designed for screen presentation — agent presents on laptop to client sitting across.',
    },
  }

  return (
    <div className="space-y-6 animate-slide-up">
      <div>
        <h2 className="text-base font-medium text-dark-800 mb-1">Choose your template</h2>
        <p className="text-sm text-dark-400">
          Select based on how the client will receive and view this offer.
        </p>
      </div>

      <div className="space-y-3">
        {TEMPLATE_OPTIONS.map(template => {
          const Icon = ICONS[template.id]
          const preview = PREVIEWS[template.id]
          const isSelected = selected === template.id

          return (
            <button
              key={template.id}
              type="button"
              onClick={() => setSelected(template.id)}
              className={cn(
                'w-full flex items-start gap-4 rounded-xl border-2 p-4 text-left transition-all duration-150',
                isSelected
                  ? 'border-gold-400 bg-gold-50'
                  : 'border-dark-200 bg-white hover:border-dark-300 hover:bg-dark-50'
              )}
            >
              {/* Template preview thumbnail */}
              <div
                className="w-14 h-18 rounded-lg shrink-0 flex items-center justify-center"
                style={{ background: preview.bg, minHeight: '72px' }}
              >
                <div
                  className="w-1 h-8 rounded-full"
                  style={{ background: preview.accent }}
                />
              </div>

              {/* Info */}
              <div className="flex-1">
                <div className="flex items-center gap-2 mb-1">
                  <Icon className={cn(
                    'w-4 h-4',
                    isSelected ? 'text-gold-600' : 'text-dark-400'
                  )} />
                  <span className={cn(
                    'text-sm font-medium',
                    isSelected ? 'text-gold-700' : 'text-dark-800'
                  )}>
                    {template.name}
                  </span>
                  <span className="text-xs text-dark-400">
                    {template.pages} pages · {template.orientation}
                  </span>
                </div>
                <p className="text-xs font-medium text-dark-500 mb-1">
                  Best for: {template.best_for}
                </p>
                <p className="text-xs text-dark-400 leading-relaxed">
                  {preview.description}
                </p>
              </div>

              {/* Selected indicator */}
              <div className={cn(
                'w-5 h-5 rounded-full border-2 flex items-center justify-center shrink-0 mt-0.5',
                isSelected ? 'border-gold-500' : 'border-dark-300'
              )}>
                {isSelected && (
                  <div className="w-2.5 h-2.5 rounded-full bg-gold-500" />
                )}
              </div>
            </button>
          )
        })}
      </div>

      {/* Quick guide */}
      <div className="rounded-xl bg-dark-50 border border-dark-100 p-4">
        <p className="text-xs font-medium text-dark-600 mb-2">Quick guide</p>
        <div className="space-y-1.5 text-xs text-dark-500">
          <p><span className="font-medium text-dark-700">WhatsApp</span> → Classic Dark (T1) — portrait, opens perfectly on phone</p>
          <p><span className="font-medium text-dark-700">Email</span> → Editorial White (T2) — clean, printable, professional</p>
          <p><span className="font-medium text-dark-700">In-person meeting</span> → Pitch Deck (T3) — landscape, best on laptop screen</p>
        </div>
      </div>

      {/* Navigation */}
      <div className="flex gap-3 pt-2">
        <button type="button" onClick={onBack} className="btn-secondary">
          <ChevronLeft className="w-4 h-4" /> Back
        </button>
        <button
          type="button"
          onClick={() => onNext(selected)}
          className="btn-primary flex-1"
        >
          Review offer <ChevronRight className="w-4 h-4" />
        </button>
      </div>
    </div>
  )
}
