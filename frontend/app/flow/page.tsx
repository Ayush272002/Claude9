'use client'

// Import necessary components and hooks; using shadcn/ui for styled components
import { useEffect, useState } from 'react'
import { Button } from '@/components/ui/button'
import { Card } from '@/components/ui/card'
import { Input } from "@/components/ui/input"
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "@/components/ui/tooltip"
import { Search, ArrowLeft, ArrowRight, ChevronRight } from 'lucide-react'
import { emotions as emotionsData } from '../utils/emotions'

// Define the shape of emotion objects
type Emotion = {
  name: string  // the name of the emotion
  value: string  // emoji representation of emotion
  category: {
    energy: 'high' | 'low'
    pleasant: boolean
  }
}

const formatEmotionName = (str: string): string => {
  return str.split('_')
    .map((word, index) => {
      // Capitalise first char of first word
      if (index === 0) {
        return word.charAt(0).toUpperCase() + word.slice(1).toLowerCase()
      }
      // ensure subsequent chars are lowercase
      return word.toLowerCase()
    })
    .join(' ')
}

export default function Flow() {
  // State management for our emotion picker
  const [emotions, setEmotions] = useState<Emotion[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [selectedEmotion, setSelectedEmotion] = useState<Emotion | null>(null)
  const [searchQuery, setSearchQuery] = useState('')
  const [hoveredEmotion, setHoveredEmotion] = useState<string | null>(null)

  // Set emotions when component mounts
  useEffect(() => {
    setEmotions(emotionsData)
    setLoading(false)
  }, [])

  // Helper functions for emotion filtering and display
  const getQuadrantEmotions = (energy: 'high' | 'low', pleasant: boolean) => {
    return emotions.filter(emotion => 
      emotion.category.energy === energy && 
      emotion.category.pleasant === pleasant
    )
  }

  const isEmotionMatched = (emotion: Emotion) => {
    if (!searchQuery) return true
    return emotion.name.toLowerCase().includes(searchQuery.toLowerCase())
  }

  // Generate tailwind classes for emotion buttons
  const getButtonStyles = (emotion: Emotion, energy: 'high' | 'low', pleasant: boolean) => {
    const isMatched = isEmotionMatched(emotion)
    const isHovered = hoveredEmotion === emotion.name
    const shouldDim = hoveredEmotion !== null && !isHovered
    const baseStyles = 'transition-transform duration-200 border'
    let colorStyles = ''
    
    if (energy === 'high' && !pleasant) {
      colorStyles = 'border-red-500/30 hover:bg-red-500/10 hover:border-red-500/50'
    }
    
    else if (energy === 'low' && !pleasant) {
      colorStyles = 'border-blue-500/30 hover:bg-blue-500/10 hover:border-blue-500/50'
    }
    
    else if (energy === 'high' && pleasant) {
      colorStyles = 'border-yellow-500/30 hover:bg-yellow-500/10 hover:border-yellow-500/50'
    }
    
    else {
      colorStyles = 'border-green-500/30 hover:bg-green-500/10 hover:border-green-500/50'
    }

    const matchStyles = isMatched 
      ? 'opacity-100' 
      : 'opacity-30 hover:opacity-50'

    const hoverStyles = shouldDim 
      ? 'opacity-30' 
      : isHovered 
        ? 'opacity-100 scale-110' 
        : ''

    return `${baseStyles} ${colorStyles} ${matchStyles} ${hoverStyles}`
  }

  // Loading state
  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-b from-purple-100 to-blue-100">
        <div className="container mx-auto py-10">
          <Card className="flex justify-center items-center h-64 bg-white/80 backdrop-blur-sm">
            <div className="text-xl text-gray-600">Loading emotions...</div>
          </Card>
        </div>
      </div>
    )
  }

  // Error state
  if (error) {
    return (
      <div className="min-h-screen bg-gradient-to-b from-purple-100 to-blue-100">
        <div className="container mx-auto py-10">
          <Card className="flex justify-center items-center h-64 bg-white/80 backdrop-blur-sm border-red-500">
            <div className="text-xl text-red-500">{error}</div>
          </Card>
        </div>
      </div>
    )
  }

  const EmotionButton = ({ emotion, energy, pleasant }: { emotion: Emotion, energy: 'high' | 'low', pleasant: boolean }) => (
    <Tooltip delayDuration={100}>
      <TooltipTrigger asChild>
        <Button
          onClick={() => {
            setSelectedEmotion(prev => prev?.name === emotion.name ? null : emotion)
          }}
          onMouseEnter={() => setHoveredEmotion(emotion.name)}
          onMouseLeave={() => setHoveredEmotion(null)}
          className={`w-16 h-16 rounded-full bg-white/50
            will-change-transform
            ${getButtonStyles(emotion, energy, pleasant)}
            ${selectedEmotion?.name === emotion.name ? `ring-2 ${
              energy === 'high' && !pleasant ? 'ring-red-500 bg-red-500/20' :
              energy === 'low' && !pleasant ? 'ring-blue-500 bg-blue-500/20' :
              energy === 'high' && pleasant ? 'ring-yellow-500 bg-yellow-500/20' :
              'ring-green-500 bg-green-500/20'
            }` : ''}`}
        >
          <span className="text-2xl transform-gpu">{emotion.value}</span>
        </Button>
      </TooltipTrigger>
      <TooltipContent 
        className="bg-white/90 border-none shadow-lg"
        side="top"
      >
        <p className="text-sm font-medium text-gray-700">{formatEmotionName(emotion.name)}</p>
      </TooltipContent>
    </Tooltip>
  )

  return (
    <div className="min-h-screen bg-gradient-to-b from-purple-100 to-blue-100 select-none">
      {/* Navigation Header */}
      <div className="container mx-auto py-3 px-4">
        <div className="flex justify-between items-center mb-3">
          <Button variant="ghost" size="icon" className="hover:bg-white/20 rounded-xl">
            <ArrowLeft className="h-5 w-5 text-gray-600" />
          </Button>
          <div className="relative flex-1 max-w-xs mx-4">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-4 w-4 pointer-events-none" />
            <Input
              type="text"
              placeholder="Search emotions..."
              className="pl-10 pr-4 py-1.5 rounded-2xl bg-white/50 border-none focus-visible:ring-2 focus-visible:ring-purple-500/50 text-gray-700 text-sm"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
            />
          </div>
          <Button variant="ghost" size="icon" className="hover:bg-white/20 rounded-xl">
            <ArrowRight className="h-5 w-5 text-gray-600" />
          </Button>
        </div>
      </div>

      {/* Main content area with grid and selection */}
      <div className="container mx-auto px-4">
        <div className="flex items-center justify-center gap-8">
          {/* Emotion Grid */}
          <div className="relative w-full max-w-3xl aspect-square p-12 rounded-3xl border border-white/20 overflow-hidden bg-white/40 backdrop-blur-sm">
            {/* quadrant labels */}
            <div className="absolute inset-0 pointer-events-none">
              <div className="absolute top-4 left-1/2 -translate-x-1/2 
                  text-sm uppercase tracking-wider font-medium 
                  text-gray-600 whitespace-nowrap">
                High Energy
              </div>
              <div className="absolute bottom-4 left-1/2 -translate-x-1/2 
                  text-sm uppercase tracking-wider font-medium 
                  text-gray-600 whitespace-nowrap">
                Low Energy
              </div>
              <div className="absolute left-0 top-1/2 -translate-y-1/2 -rotate-90 
                  text-sm uppercase tracking-wider font-medium 
                  text-gray-600 whitespace-nowrap">
                Unpleasant
              </div>
              <div className="absolute right-0 top-1/2 -translate-y-1/2 rotate-90 
                  text-sm uppercase tracking-wider font-medium 
                  text-gray-600 whitespace-nowrap">
                Pleasant
              </div>
            </div>

            {/* Emotion quadrants grid */}
            <TooltipProvider>
              <div className="grid grid-cols-2 h-full">
                {/* Top Left - High Energy, Unpleasant */}
                <div className="p-2">
                  <div className="grid grid-cols-3 gap-3 h-full place-items-center">
                    {getQuadrantEmotions('high', false).map((emotion, index) => (
                      <EmotionButton
                        key={index}
                        emotion={emotion}
                        energy="high"
                        pleasant={false}
                      />
                    ))}
                  </div>
                </div>

                {/* Top Right - High Energy, Pleasant */}
                <div className="p-2">
                  <div className="grid grid-cols-3 gap-3 h-full place-items-center">
                    {getQuadrantEmotions('high', true).map((emotion, index) => (
                      <EmotionButton
                        key={index}
                        emotion={emotion}
                        energy="high"
                        pleasant={true}
                      />
                    ))}
                  </div>
                </div>

                {/* Bottom Left - Low Energy, Unpleasant */}
                <div className="p-2">
                  <div className="grid grid-cols-3 gap-3 h-full place-items-center">
                    {getQuadrantEmotions('low', false).map((emotion, index) => (
                      <EmotionButton
                        key={index}
                        emotion={emotion}
                        energy="low"
                        pleasant={false}
                      />
                    ))}
                  </div>
                </div>

                {/* Bottom Right - Low Energy, Pleasant */}
                <div className="p-2">
                  <div className="grid grid-cols-3 gap-3 h-full place-items-center">
                    {getQuadrantEmotions('low', true).map((emotion, index) => (
                      <EmotionButton
                        key={index}
                        emotion={emotion}
                        energy="low"
                        pleasant={true}
                      />
                    ))}
                  </div>
                </div>
              </div>
            </TooltipProvider>
          </div>

          {/* Selection and Continue */}
          <div className="flex flex-col items-center gap-6 min-w-[200px]">
            {selectedEmotion ? (
              <>
                <div className="flex items-center gap-4 bg-white/60 backdrop-blur-sm px-6 py-4 rounded-2xl">
                  <span className="text-4xl">{selectedEmotion.value}</span>
                  <span className="text-lg font-medium text-gray-700">
                    {formatEmotionName(selectedEmotion.name)}
                  </span>
                </div>
                <Button 
                  size="lg" 
                  className="rounded-xl bg-purple-500 hover:bg-purple-600 text-white gap-2"
                >
                  Continue
                  <ChevronRight className="h-5 w-5" />
                </Button>
              </>
            ) : (
              <div className="text-gray-500 text-sm font-medium text-center max-w-44 mx-auto">
                Select the emoji that best describes how you feel right now
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  )
}
