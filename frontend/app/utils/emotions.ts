import { NextResponse } from 'next/server'

type EmotionMap = { [key: string]: string }

// Emotions organized by category
const HIGH_ENERGY_UNPLEASANT: EmotionMap = {
  ENRAGED: '😡',
  PANICKED: '😨',
  STRESSED: '😓',
  FRUSTRATED: '😠',
  ANGRY: '🤬',
  ANXIOUS: '😟',
  WORRIED: '😧',
  IRRITATED: '😒',
  ANNOYED: '😑',
}

const LOW_ENERGY_UNPLEASANT: EmotionMap = {
  DISGUSTED: '🤮',
  DISAPPOINTED: '😞',
  SAD: '😢',
  LONELY: '😔',
  HOPELESS: '😩',
  EXHAUSTED: '😫',
  DEPRESSED: '😭',
  BORED: '😶',
  DRAINED: '🫠',
}

const HIGH_ENERGY_PLEASANT: EmotionMap = {
  SURPRISED: '😯',
  UPBEAT: '😁',
  FESTIVE: '🥳',
  EXCITED: '🤩',
  OPTIMISTIC: '🌞',
  HAPPY: '😃',
  JOYFUL: '😆',
  HOPEFUL: '🙏',
  BLISSFUL: '🫶',
}

const LOW_ENERGY_PLEASANT: EmotionMap = {
  AT_EASE: '🙂',
  CONTENT: '😊',
  LOVING: '❤️',
  GRATEFUL: '😇',
  CALM: '💆‍♂️',
  RELAXED: '🍃',
  RESTFUL: '🌿',
  PEACEFUL: '🛏️',
  SERENE: '🌊'
}

// Helper function to determine emotion category based on which object contains the emotion
function getEmotionCategory(emotionName: string): { energy: 'high' | 'low'; pleasant: boolean } {
  if (emotionName in HIGH_ENERGY_UNPLEASANT) {
    return { energy: 'high', pleasant: false }
  }
  if (emotionName in LOW_ENERGY_UNPLEASANT) {
    return { energy: 'low', pleasant: false }
  }
  if (emotionName in HIGH_ENERGY_PLEASANT) {
    return { energy: 'high', pleasant: true }
  }
  return { energy: 'low', pleasant: true }
}

export async function GET() {
  try {
    // Combine all emotion categories
    const EMOTION_VALUES: EmotionMap = {
      ...HIGH_ENERGY_UNPLEASANT,
      ...LOW_ENERGY_UNPLEASANT,
      ...HIGH_ENERGY_PLEASANT,
      ...LOW_ENERGY_PLEASANT,
    }

    const emotions = Object.keys(EMOTION_VALUES).map(name => ({
      name,
      value: EMOTION_VALUES[name],
      category: getEmotionCategory(name)
    }))

    return NextResponse.json(emotions)
  } catch (error) {
    console.error('Error fetching emotions:', error)
    return NextResponse.json(
      { error: 'Failed to fetch emotions' },
      { status: 500 }
    )
  }
} 