'use client'

// Import necessary components and hooks; using shadcn/ui for styled components
import { useEffect, useState } from 'react'
import { Button } from '@/components/ui/button'
import { Card } from '@/components/ui/card'
import { Input } from "@/components/ui/input"
import { Switch } from "@/components/ui/switch"
import { Label } from "@/components/ui/label"
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "@/components/ui/tooltip"
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog"
import { Search, ArrowLeft, ArrowRight, ChevronRight, ChevronLeft, Send, RefreshCw, Music, Brain } from 'lucide-react'
import { emotions as emotionsData } from '../utils/emotions'
import axios from "axios";

import config from "@/config.json";
import { sendThoughts } from '@/utils/api'
import { useRouter } from 'next/navigation'
import { Skeleton } from "@/components/ui/skeleton"

const API_BASE_URL = config.apiBaseUrl;

// Define the shape of emotion objects
type Emotion = {
  name: string  // the name of the emotion
  value: string  // emoji representation of emotion
  category: {
    energy: 'high' | 'low'
    pleasant: boolean
  }
}

type LifestyleQuestion = {
  id: string
  text: string
  checked: boolean
}

type ChatMessage = {
  role: 'assistant' | 'user';
  content: string;
};

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
  const router = useRouter()
  // State management for our emotion picker
  const [emotions, setEmotions] = useState<Emotion[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [selectedEmotion, setSelectedEmotion] = useState<Emotion | null>(null)
  const [searchQuery, setSearchQuery] = useState('')
  const [hoveredEmotion, setHoveredEmotion] = useState<string | null>(null)
  const [step, setStep] = useState<'emotion' | 'reason' | 'lifestyle' | 'analysis' | 'insights' | 'actions'>('emotion')
  const [reasonText, setReasonText] = useState('')  // user's reason for the selected emotion
  const [chatResponse, setChatResponse] = useState<string | null>(null)  // Add state for chat response
  const [isThinking, setIsThinking] = useState(false)  // Add loading state for API call
  const MIN_CHARS = 4  // Minimum characters required
  const [hasAttemptedSubmit, setHasAttemptedSubmit] = useState(false)
  const [lifestyleAnswers, setLifestyleAnswers] = useState<LifestyleQuestion[]>([
    { id: 'exercise', text: 'Did you exercise or play sports today?', checked: false },
    { id: 'friends', text: 'Did you meet friends today?', checked: false },
    { id: 'sleep', text: 'Did you sleep well?', checked: false },
  ])
  const [chatMessages, setChatMessages] = useState<ChatMessage[]>([]);
  const [currentInput, setCurrentInput] = useState('');
  const [isChatMode, setIsChatMode] = useState(false);
  const [hasFirstInput, setHasFirstInput] = useState(false);
  const MIN_CHAT_CHARS = 5; // Minimum characters for chat messages
  const [insights, setInsights] = useState<string | null>(null);
  const [memeURL, setMemeURL] = useState<string | null>(null);
  const [playlistURL, setPlaylistURL] = useState<string | null>(null);
  const [loadingInsights, setLoadingInsights] = useState(false);
  const [showBackWarning, setShowBackWarning] = useState(false)
  const [pendingBackAction, setPendingBackAction] = useState(false)
  const [isRootRedirect, setIsRootRedirect] = useState(false)

  // Set emotions when component mounts
  useEffect(() => {
    const token = localStorage.getItem('token')
    if (!token) {
      router.push('/')
      return
    }

    setEmotions(emotionsData)
    setLoading(false)
  }, [router])

  // Add effect to reset chat states when emotion changes
  useEffect(() => {
    setChatMessages([])
    setCurrentInput('')
    setIsChatMode(false)
    setHasFirstInput(false)
    setReasonText('')
  }, [selectedEmotion])

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

  // Handle continue button click
  const handleContinue = async () => {
    if (step === 'emotion' && selectedEmotion) {
      setStep('reason')
    } else if (step === 'reason') {
      if ((isChatMode && hasFirstInput) || (!isChatMode && reasonText.length >= MIN_CHARS)) {
        setStep('lifestyle')
      } else {
        setHasAttemptedSubmit(true)
      }
    } else if (step === 'lifestyle') {
      try {
        setStep('analysis')
        setLoadingInsights(true);
        const res = await axios.post(
          `${API_BASE_URL}/api/v1/profile/checkin`,
          {
            played_sport: lifestyleAnswers.find(q => q.id === 'exercise')?.checked,
            met_friends: lifestyleAnswers.find(q => q.id === 'friends')?.checked,
            slept_well: lifestyleAnswers.find(q => q.id === 'sleep')?.checked,
            init_mood: selectedEmotion?.name,
            thoughts: chatMessages.map(msg => `${msg.role}: ${msg.content}`).join("\n"),
          },
          {
            headers: {
              'Authorization': `Bearer ${localStorage.getItem("token")}`,
              'Content-Type': 'application/json',
              'Accept': 'application/json'
            },
            withCredentials: true
          }
        );
        setLoadingInsights(false);
        setInsights(res.data.checkIn.insights_actions);
        setMemeURL(res.data.meme);
        setPlaylistURL(res.data.checkIn.playlist);
      } catch (error) {
        console.error('Error during checkin:', error);
        setLoadingInsights(false);
        setError('Failed to submit check-in. Please try again.');
      }
    } else if (step === 'analysis') {
      setStep('insights')
    } else if (step === 'insights') {
      router.push("/dashboard");
    }
  }

  // Modify handleBack to show warning if needed
  const handleBack = () => {
    if (step === 'emotion') {
      if (selectedEmotion) {
        setShowBackWarning(true)
        setPendingBackAction(true)
        setIsRootRedirect(true)
        return
      }
      router.push('/')
      return
    }
    
    if (step === 'reason' && (reasonText.length > 0 || chatMessages.length > 0)) {
      setShowBackWarning(true)
      setPendingBackAction(true)
      setIsRootRedirect(false)
      return
    }
    
    if (step === 'reason') {
      setStep('emotion')
    } else if (step === 'lifestyle') {
      setStep('reason')
    } else if (step === 'analysis') {
      setStep('lifestyle')
    } else if (step === 'insights') {
      setStep('analysis')
    } else if (step === 'actions') {
      setStep('insights')
    }
  }

  const confirmBack = () => {
    if (pendingBackAction) {
      if (isRootRedirect) {
        router.push('/')
      } else {
        setStep('emotion')
      }
      setPendingBackAction(false)
      setIsRootRedirect(false)
    }
    setShowBackWarning(false)
  }

  const cancelBack = () => {
    setPendingBackAction(false)
    setIsRootRedirect(false)
    setShowBackWarning(false)
  }

  const handleUnsure = async () => {
    if (!selectedEmotion) return;
    
    setIsChatMode(true);
    setIsThinking(true);
    
    const { data, error } = await sendThoughts(undefined, formatEmotionName(selectedEmotion.name));

    if (error) {
      console.error('Error getting response:', error);
      setChatMessages([{ 
        role: 'assistant', 
        content: `Error: ${error}. Click to retry.` 
      }]);
    }
    
    else if (data) {
      const lastMessage = data.messages[data.messages.length - 1];
      setChatMessages([{ role: 'assistant', content: lastMessage.content }]);
    }

    setIsThinking(false);
  };

  const handleChatSubmit = async (isResend: boolean = false) => {
    if (!isResend && !currentInput.trim()) return;
    if (!isResend && currentInput.length < MIN_CHAT_CHARS) return;

    // If it's a resend and we don't have enough messages, return
    if (isResend && chatMessages.length < 2) {
      console.error('Not enough messages to resend');
      return;
    }

    // If it's a resend, use the last user message
    const messageToSend = isResend && chatMessages.length >= 2
      ? chatMessages[chatMessages.length - 2].content // Get the last user message
      : currentInput;

    // If it's a resend, remove the last failed message
    const baseMessages = isResend 
      ? chatMessages.slice(0, -1) // Remove the error message
      : chatMessages;

    // Add user's message to chat
    const updatedMessages: ChatMessage[] = [...baseMessages];
    if (!isResend) {
      updatedMessages.push({ role: 'user' as const, content: messageToSend });
    }
    
    setChatMessages(updatedMessages);
    if (!isResend) {
      setCurrentInput('');
      setHasFirstInput(true);
    }

    // Only continue with API call if we haven't reached max messages
    if (updatedMessages.length < 6) {
      setIsThinking(true);

      const { data, error } = await sendThoughts(updatedMessages);

      if (error) {
        console.error('Error getting response:', error);
        setChatMessages([...updatedMessages, { 
          role: 'assistant', 
          content: `Error: ${error}. Click to retry.` 
        }]);
      } else if (data) {
        const lastMessage = data.messages[data.messages.length - 1];
        setChatMessages([...updatedMessages, { role: 'assistant', content: lastMessage.content }]);
      }

      setIsThinking(false);
    }
  };

  const handleDisabledClick = () => {
    if (reasonText.length < MIN_CHARS) {
      setHasAttemptedSubmit(true)
    }
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
      {/* Add alert dialogue for going back */}
      <AlertDialog open={showBackWarning} onOpenChange={setShowBackWarning}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Are you sure?</AlertDialogTitle>
            <AlertDialogDescription>
              {isRootRedirect 
                ? "Going back to home will clear your current progress. This action cannot be undone."
                : "Going back will clear your current discussion. This action cannot be undone."
              }
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel 
              onClick={cancelBack}
              className="rounded-xl hover:bg-gray-100 border-gray-200"
            >
              Cancel
            </AlertDialogCancel>
            <AlertDialogAction 
              onClick={confirmBack}
              className="rounded-xl bg-purple-500 hover:bg-purple-600 text-white"
            >
              Continue
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>

      {/* Navigation Header */}
      <div className="container mx-auto py-3 px-4">
        <div className="flex justify-between items-center mb-3">
          <Button 
            variant="ghost" 
            size="icon" 
            className="hover:bg-white/20 rounded-xl"
            onClick={handleBack}
          >
            <ArrowLeft className="h-5 w-5 text-gray-600" />
          </Button>
          {step === 'emotion' && (
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
          )}
          <Button variant="ghost" size="icon" className="hover:bg-white/20 rounded-xl invisible">
            <ArrowRight className="h-5 w-5 text-gray-600" />
          </Button>
        </div>
      </div>

      {/* Main content area */}
      <div className="container mx-auto px-4">
        {step === 'emotion' ? (
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
                    onClick={handleContinue}
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
        ) : step === 'reason' ? (
          <div className="max-w-2xl mx-auto">
            <Card className="p-8 bg-white/80 backdrop-blur-sm">
              <div className="flex flex-col items-center gap-6">
                {/* Header section w/ emoji and question */}
                <div className="flex items-center gap-4">
                  <span className="text-4xl">{selectedEmotion?.value}</span>
                  <h2 className="text-2xl font-medium text-gray-700">
                    What made you feel {formatEmotionName(selectedEmotion?.name || '').toLowerCase()}?
                  </h2>
                </div>

                {/* Text input section */}
                <div className="w-full">
                  {!isChatMode ? (
                    <div className="relative">
                      <Input
                        className={`w-full text-lg p-4 bg-white/50 border-none focus-visible:ring-2 focus-visible:ring-purple-500/50 ${
                          hasAttemptedSubmit && reasonText.length < MIN_CHARS ? 'ring-2 ring-orange-500/50' : ''
                        }`}
                        placeholder="Share your thoughts..."
                        value={reasonText}
                        onChange={(e) => {
                          // Remove hashtags from input for future database storage retrieval and parsing purposes
                          const cleanText = e.target.value.split('#').join('');
                          setReasonText(cleanText);
                          
                          if (cleanText.length >= MIN_CHARS) {
                            setHasAttemptedSubmit(false)
                          }
                        }}
                      />

                      {/* Error message for min. char. requirement */}
                      {hasAttemptedSubmit && reasonText.length < MIN_CHARS && (
                        <p className="absolute -bottom-6 left-0 text-sm text-orange-600">
                          Please write at least {MIN_CHARS} characters ({MIN_CHARS - reasonText.length} more needed)
                        </p>
                      )}
                    </div>
                  ) : (
                    <div className="space-y-4">
                      {/* Chat messages */}
                      <div className="space-y-4">
                        {chatMessages.map((message, index) => (
                          <div
                            key={index}
                            className={`flex ${
                              message.role === 'assistant' ? 'justify-start' : 'justify-end'
                            }`}
                          >
                            <div
                              className={`py-2 px-3 rounded-2xl max-w-[70%] ${
                                message.role === 'assistant'
                                  ? 'bg-gray-100 text-gray-700'
                                  : 'bg-purple-500 text-white'
                              }`}
                            >
                              <div className="flex items-start gap-2">
                                <p className={`text-sm whitespace-pre-wrap flex-1 ${
                                  message.role === 'user' ? 'font-normal' : ''
                                }`}>{message.content}</p>
                                {message.role === 'assistant' && message.content.startsWith('Error:') && (
                                  <Button
                                    variant="ghost"
                                    size="icon"
                                    onClick={() => handleChatSubmit(true)}
                                    className="mt-[-4px] text-orange-600 hover:text-orange-700"
                                  >
                                    <RefreshCw className="h-4 w-4" />
                                  </Button>
                                )}
                              </div>
                            </div>
                          </div>
                        ))}
                        {isThinking && (
                          <div className="flex justify-start">
                            <div className="py-2 px-3 bg-gray-100 rounded-2xl max-w-[70%] w-[300px]">
                              <div className="space-y-2">
                                <Skeleton className="h-4 w-[250px]" />
                                <Skeleton className="h-4 w-[200px]" />
                              </div>
                            </div>
                          </div>
                        )}
                      </div>

                      {/* Input field if we haven't reached max messages */}
                      {chatMessages.length < 6 && !isThinking && (
                        <div className="flex gap-2">
                          <div className="flex-1 relative">
                            <Input
                              className={`w-full text-lg p-4 bg-white/50 border-none focus-visible:ring-2 focus-visible:ring-purple-500/50 ${
                                currentInput.length > 0 && currentInput.length < MIN_CHAT_CHARS ? 'ring-2 ring-orange-500/50' : ''
                              }`}
                              placeholder="Type your message..."
                              value={currentInput}
                              onChange={(e) => setCurrentInput(e.target.value)}
                              onKeyPress={(e) => {
                                if (e.key === 'Enter' && currentInput.length >= MIN_CHAT_CHARS) {
                                  handleChatSubmit(false);
                                }
                              }}
                            />
                            {currentInput.length > 0 && currentInput.length < MIN_CHAT_CHARS && (
                              <p className="absolute -bottom-6 left-0 text-sm text-orange-600">
                                Please write at least {MIN_CHAT_CHARS} characters ({MIN_CHAT_CHARS - currentInput.length} more needed)
                              </p>
                            )}
                          </div>
                          <Button
                            onClick={() => handleChatSubmit(false)}
                            className="bg-purple-500 hover:bg-purple-600 text-white px-6"
                            disabled={!currentInput.trim() || currentInput.length < MIN_CHAT_CHARS}
                          >
                            <Send className="h-5 w-5" />
                          </Button>
                        </div>
                      )}
                    </div>
                  )}
                </div>

                {/* Navigation buttons */}
                <div className="flex gap-4">
                  {!isChatMode && (
                    <Button
                      variant="outline" 
                      size="lg"
                      className="rounded-xl gap-2 relative overflow-hidden transition-all duration-300 hover:shadow-[0_0_15px_rgba(168,85,247,0.5)] before:absolute before:inset-0 before:-translate-x-full hover:before:translate-x-0 before:bg-gradient-to-r before:from-transparent before:via-purple-500/20 before:to-transparent before:transition-transform before:duration-700 before:ease-in-out border border-purple-500/30 hover:border-purple-500/70"
                      onClick={handleUnsure}
                      disabled={!selectedEmotion}
                    >
                      <span className="relative z-10">I'm not sure</span>
                      <span className="relative z-10 animate-pulse">✨</span>
                    </Button>
                  )}

                  <TooltipProvider>
                    <Tooltip>
                      {/* Wrapper for the continue button with tooltip  */}
                      <TooltipTrigger asChild>
                        <div 
                          onClick={!isChatMode && reasonText.length < MIN_CHARS ? handleDisabledClick : undefined}
                          className={!isChatMode && reasonText.length < MIN_CHARS ? 'cursor-not-allowed' : ''}
                        >
                          <Button 
                            size="lg" 
                            className={`rounded-xl gap-2 ${
                              (isChatMode && hasFirstInput) || (!isChatMode && reasonText.length >= MIN_CHARS)
                                ? 'bg-purple-500 hover:bg-purple-600' 
                                : 'bg-purple-500/50'
                            } text-white`}
                            onClick={handleContinue}
                            disabled={
                              (isChatMode && !hasFirstInput) ||
                              (!isChatMode && (!reasonText.trim() || reasonText.length < MIN_CHARS))
                            }
                          >
                            Continue
                            <ChevronRight className="h-5 w-5" />
                          </Button>
                        </div>
                      </TooltipTrigger>

                      {(!isChatMode && reasonText.trim() && reasonText.length < MIN_CHARS) && (
                        <TooltipContent 
                          side="top" 
                          className="bg-white/90 border-none shadow-lg"
                        >
                          <p className="text-sm text-orange-600">
                            Please write at least {MIN_CHARS} characters ({MIN_CHARS - reasonText.length} more needed)
                          </p>
                        </TooltipContent>
                      )}
                    </Tooltip>
                  </TooltipProvider>
                </div>
              </div>
            </Card>
          </div>
        ) : step === 'lifestyle' ? (
          <div className="max-w-2xl mx-auto">
            <Card className="p-8 bg-white/80 backdrop-blur-sm">
              <div className="flex flex-col items-center gap-8">
                <h2 className="text-3xl font-bold text-gray-700">
                  How's life?
                </h2>
                
                <div className="w-full space-y-8">
                  {/* Map through lifestyle questions and render switches  */}
                  {lifestyleAnswers.map((question) => (
                    <div key={question.id} className="flex items-center justify-between bg-white/50 p-6 rounded-xl">
                      <div className="flex items-center gap-3">
                        <span className="text-2xl">
                          {question.id === 'exercise' ? '🏃‍♂️' : 
                           question.id === 'friends' ? '👥' : 
                           question.id === 'sleep' ? '😴' : ''}
                        </span>
                        <Label 
                          htmlFor={question.id} 
                          className="text-xl font-medium text-gray-700 cursor-pointer"
                        >
                          {question.text}
                        </Label>
                      </div>
                      <div className="flex items-center gap-3">
                        <span className="text-sm font-medium text-gray-500">
                          {question.checked ? 'Yes' : 'No'}
                        </span>
                        <Switch
                          id={question.id}
                          checked={question.checked}
                          onCheckedChange={(checked) => {
                            setLifestyleAnswers(prev => prev.map(q => 
                              q.id === question.id ? { ...q, checked } : q
                            ))
                          }}
                          className="data-[state=checked]:bg-purple-500"
                        />
                      </div>
                    </div>
                  ))}
                </div>

                <Button 
                  size="lg" 
                  className="rounded-xl bg-purple-500 hover:bg-purple-600 text-white gap-2 mt-4"
                  onClick={handleContinue}
                >
                  Continue
                  <ChevronRight className="h-5 w-5" />
                </Button>
              </div>
            </Card>
          </div>
        ) : step === 'analysis' ? (
          <div className="max-w-2xl mx-auto">
            <Card className="p-8 bg-white/80 backdrop-blur-sm">
              <div className="flex flex-col items-center gap-8">
                <h2 className="text-3xl font-bold text-gray-700">
                  Analysis
                </h2>
                
                {/* Placeholder for meme image */}
                {
                  (memeURL != undefined)
                  ? 
                  <div className="w-full aspect-video bg-gray-200/50 rounded-xl flex items-center justify-center">
                    <img src={memeURL} className="h-full bg-white">                    
                    </img>
                  </div>
                  :
                  <div className="w-full aspect-video bg-gray-200/50 rounded-xl flex items-center justify-center">
                    <p className="text-gray-500 text-lg">Loading...</p>
                  </div>
                }

                <Button 
                  size="lg" 
                  className="rounded-xl bg-purple-500 hover:bg-purple-600 text-white gap-2"
                  onClick={handleContinue}
                >
                  Continue
                  <ChevronRight className="h-5 w-5" />
                </Button>
              </div>
            </Card>
          </div>
        ) : step === 'insights' ? (
          <div className="max-w-2xl mx-auto">
            <Card className="p-8 bg-white/80 backdrop-blur-sm">
              <div className="flex flex-col items-center gap-8">
                <h2 className="text-3xl font-bold text-gray-700">
                  Insights
                </h2>
                
                <div className="w-full p-6 bg-white/50 rounded-xl">
                  {loadingInsights ? (
                    <div className="flex flex-col gap-4 py-8">
                      <Skeleton className="h-4 w-[300px]" />
                      <Skeleton className="h-4 w-[250px]" />
                      <Skeleton className="h-4 w-[280px]" />
                      <Skeleton className="h-4 w-[260px]" />
                      <Skeleton className="h-4 w-[240px]" />
                    </div>
                  ) : insights ? (
                    <div className="prose prose-purple max-w-none">
                      <div className="text-gray-700 text-lg leading-relaxed whitespace-pre-wrap">
                        <div className="flex gap-2">
                          <Brain className="h-8 w-8 text-purple-600" />
                          <div className="text-purple-600 text-2xl">Feedback</div>  
                        </div>
                        {insights}
                        <br /><br />
                        <a href={playlistURL || undefined} className="text-gray-700 text-lg leading-relaxed whitespace-pre-wrap">
                          <div className="flex gap-2">
                            <Music className="h-8 w-8 text-purple-600" />
                            <div className="text-purple-600 text-2xl">Suggested playlist</div>  
                          </div>
                          {playlistURL}
                        </a>
                      </div>
                    </div>
                  ) : (
                    <div className="flex items-center justify-center py-8">
                      <p className="text-red-500">Failed to load insights. Please try again.</p>
                    </div>
                  )}
                </div>

                <Button 
                  size="lg" 
                  className="rounded-xl bg-purple-500 hover:bg-purple-600 text-white gap-2"
                  onClick={handleContinue}
                >
                  Back to home
                  <ChevronRight className="h-5 w-5" />
                </Button>
              </div>
            </Card>
          </div>
        ) : (
          <div className="max-w-2xl mx-auto">
            <Card className="p-8 bg-white/80 backdrop-blur-sm">
              <div className="flex flex-col items-center gap-8">
                <h2 className="text-3xl font-bold text-gray-700">
                  Your Actions
                </h2>
                
                <div className="w-full p-6 bg-white/50 rounded-xl">
                  <p className="text-gray-700 text-lg leading-relaxed">
                    Based on your emotional state and activities, here are some recommended actions...
                    [placeholder pt3]
                  </p>
                </div>

                <Button 
                  size="lg" 
                  className="rounded-xl bg-purple-500 hover:bg-purple-600 text-white gap-2"
                  onClick={handleContinue}
                >
                  Finish
                  <ChevronRight className="h-5 w-5" />
                </Button>
              </div>
            </Card>
          </div>
        )}
      </div>
    </div>
  )
}
