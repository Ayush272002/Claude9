// API base URL; default to localhost if env var not set/doesn't work properly
import config from "@/config.json";

export const API_BASE_URL = process.env.NEXT_PUBLIC_API_URL || config.apiBaseUrl;

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

    // Use API_BASE_URL from config
    const response = await fetch(`${API_BASE_URL}/api/v1${endpoint}`, {
      ...options,
      credentials: 'include',
      mode: 'cors',
      headers: {
        'Content-Type': 'application/json',
        'Accept': 'application/json',
        ...(authToken && { Authorization: `Bearer ${authToken}` }),
        ...options.headers,
      },
    });

    if (!response.ok) {
      const errorData = await response.json().catch(() => ({ error: 'Failed to parse error response' }));
      throw new Error(errorData.error || `HTTP error! status: ${response.status}`);
    }

    const responseData = await response.json();
    return { data: responseData as T };
  }
  catch (error) {
    console.error('API Error:', error);
    
    // Handle network errors more gracefully
    if (error instanceof TypeError && error.message === 'Failed to fetch') {
      return {
        error: 'Unable to connect to the server. Please check your internet connection and try again.',
      };
    }
    
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