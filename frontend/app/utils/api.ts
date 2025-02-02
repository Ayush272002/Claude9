// API base URL; default to localhost if env var not set/doesn't work properly
export const API_BASE_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:8000';

interface ApiResponse<T> {
  data?: T;
  error?: string;
}

type Message = {
  role: 'assistant' | 'user';
  content: string;
};

type ThoughtsResponse = {
  messages: Message[];
};

type ApiError = {
  error: string;
};

export async function apiClient<T>(endpoint: string, options: RequestInit = {}): Promise<{ data?: T; error?: string }> {
  try {
    let authToken = '';
    
    // check if in browser before accessing localStorage
    if (typeof window !== 'undefined') {
      authToken = localStorage.getItem('token') || '';
    }

    const response = await fetch(`http://localhost:8000/api/v1${endpoint}`, {
      ...options,
      headers: {
        'Content-Type': 'application/json',
        ...(authToken && { Authorization: `Bearer ${authToken}` }),
        ...options.headers,
      },
    });

    const responseData = await response.json();

    if (!response.ok) {
      throw new Error(responseData.error || 'Something went wrong');
    }

    return { data: responseData as T };
  }
  catch (error) {
    console.error('API Error:', error);
    return {
      error: error instanceof Error ? error.message : 'Something went wrong',
    };
  }
}

// Sends user thoughts and emotions to the backend for processing
export async function sendThoughts(messages?: Message[], emotion?: string): Promise<{ data?: ThoughtsResponse; error?: string }> {
  return apiClient<ThoughtsResponse>('/profile/thoughts', {
    method: 'POST',
    body: JSON.stringify({ messages, emotion }),
  });
}

// Gets insights based on user's emotional state and lifestyle
export async function getInsights(data: {
  chatMessages: Message[];
  lifestyleAnswers: { id: string; checked: boolean; }[];
  selectedEmotion: string;
}): Promise<{ data?: { insights: string }; error?: string }> {
  return apiClient<{ insights: string }>('/profile/insights', {
    method: 'POST',
    body: JSON.stringify(data),
  });
} 