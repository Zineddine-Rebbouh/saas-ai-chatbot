'use client'

import Section from '@/components/section-label'
import { Label } from '@/components/ui/label'
import { Input } from '@/components/ui/input'
import { Check } from 'lucide-react'
import React from 'react'

export const THEME_PRESETS = [
  { name: 'Default Dark', bg: '#09090b', text: '#ffffff' },
  { name: 'Midnight Violet', bg: '#0f0c1b', text: '#f3e8ff' },
  { name: 'Deep Indigo', bg: '#0a0f1d', text: '#e0e7ff' },
  { name: 'Emerald Teal', bg: '#041c19', text: '#e6fffa' },
  { name: 'Sunset Crimson', bg: '#1c070c', text: '#ffe4e6' },
  { name: 'Clean Light', bg: '#f8fafc', text: '#0f172a' },
]

type Props = {
  background: string
  textColor: string
  onThemeChange: (bg: string, text: string) => void
}

export const BotThemePicker = ({ background, textColor, onThemeChange }: Props) => {
  return (
    <div className="flex flex-col gap-4">
      <Section
        label="Chatbot Theme & Colors"
        message="Customize the background & text colors of your chatbot window."
      />

      {/* Preset Swatches */}
      <div className="flex flex-col gap-2">
        <span className="text-xs font-medium text-muted-foreground">Color Presets</span>
        <div className="grid grid-cols-3 sm:grid-cols-6 gap-2.5">
          {THEME_PRESETS.map((preset) => {
            const isSelected =
              (background?.toLowerCase() === preset.bg.toLowerCase() ||
                (!background && preset.name === 'Default Dark')) &&
              (textColor?.toLowerCase() === preset.text.toLowerCase() || !textColor)

            return (
              <button
                key={preset.name}
                type="button"
                onClick={() => onThemeChange(preset.bg, preset.text)}
                className={`relative flex flex-col items-center gap-1.5 p-2 rounded-xl border transition-all hover:scale-105 ${
                  isSelected
                    ? 'border-primary ring-2 ring-primary/20 bg-primary/5'
                    : 'border-border/60 hover:border-border'
                }`}
              >
                <div
                  className="w-full h-8 rounded-lg border border-white/10 relative overflow-hidden flex items-center justify-center shadow-inner"
                  style={{ backgroundColor: preset.bg }}
                >
                  <span className="text-xs font-semibold" style={{ color: preset.text }}>
                    Aa
                  </span>
                  {isSelected && (
                    <div className="absolute top-1 right-1 w-3.5 h-3.5 rounded-full bg-primary flex items-center justify-center">
                      <Check className="w-2.5 h-2.5 text-primary-foreground" />
                    </div>
                  )}
                </div>
                <span className="text-[10px] font-medium text-muted-foreground truncate w-full text-center">
                  {preset.name}
                </span>
              </button>
            )
          })}
        </div>
      </div>

      {/* Custom Color Pickers */}
      <div className="grid grid-cols-2 gap-4 pt-2">
        <div className="flex flex-col gap-1.5">
          <Label htmlFor="bg-color" className="text-xs font-medium text-muted-foreground">
            Window Background
          </Label>
          <div className="flex items-center gap-2">
            <input
              type="color"
              id="bg-color"
              value={background || '#09090b'}
              onChange={(e) => onThemeChange(e.target.value, textColor || '#ffffff')}
              className="w-9 h-9 rounded-lg border border-border cursor-pointer bg-transparent p-0.5"
            />
            <Input
              type="text"
              value={background || '#09090b'}
              onChange={(e) => onThemeChange(e.target.value, textColor || '#ffffff')}
              className="h-9 font-mono text-xs uppercase"
              placeholder="#09090b"
            />
          </div>
        </div>

        <div className="flex flex-col gap-1.5">
          <Label htmlFor="text-color" className="text-xs font-medium text-muted-foreground">
            Text Color
          </Label>
          <div className="flex items-center gap-2">
            <input
              type="color"
              id="text-color"
              value={textColor || '#ffffff'}
              onChange={(e) => onThemeChange(background || '#09090b', e.target.value)}
              className="w-9 h-9 rounded-lg border border-border cursor-pointer bg-transparent p-0.5"
            />
            <Input
              type="text"
              value={textColor || '#ffffff'}
              onChange={(e) => onThemeChange(background || '#09090b', e.target.value)}
              className="h-9 font-mono text-xs uppercase"
              placeholder="#ffffff"
            />
          </div>
        </div>
      </div>
    </div>
  )
}

export default BotThemePicker
