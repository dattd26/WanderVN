import type { ChatbotRequest, ChatbotResponse, ApiResponse } from '../types/chatbot.types';

const API_BASE_URL = import.meta.env.VITE_API_URL || 'http://localhost:5096/api/v1';

export class ChatbotService {
  static async sendMessage(request: ChatbotRequest): Promise<ChatbotResponse | null> {
    try {
      const response = await fetch(`${API_BASE_URL}/chatbot/message`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(request),
      });

      if (!response.ok) {
        console.error('Failed to send message:', response.statusText);
        return null;
      }

      const data: ApiResponse<ChatbotResponse> = await response.json();
      return data.data || null;
    } catch (error) {
      console.error('Error sending message to chatbot:', error);
      return null;
    }
  }

  static async searchHotels(request: ChatbotRequest): Promise<any[] | null> {
    try {
      const response = await fetch(`${API_BASE_URL}/chatbot/search`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(request),
      });

      if (!response.ok) {
        console.error('Failed to search hotels:', response.statusText);
        return null;
      }

      const data: ApiResponse<any[]> = await response.json();
      return data.data || [];
    } catch (error) {
      console.error('Error searching hotels:', error);
      return null;
    }
  }

  static async getConversationHistory(userId: number, limit: number = 50): Promise<any[]> {
    try {
      const response = await fetch(`${API_BASE_URL}/chatbot/history/${userId}?limit=${limit}`, {
        method: 'GET',
        headers: {
          'Content-Type': 'application/json',
        },
      });

      if (!response.ok) {
        console.error('Failed to fetch history:', response.statusText);
        return [];
      }

      const data: ApiResponse<any[]> = await response.json();
      return data.data || [];
    } catch (error) {
      console.error('Error fetching conversation history:', error);
      return [];
    }
  }
}
