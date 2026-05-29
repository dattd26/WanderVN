import { useState, useRef, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { MessageCircle, X, Send, Plane } from 'lucide-react';
import type { ChatMessage } from '../types/chatbot.types';
import { ChatbotService } from '../services/chatbotService';

interface ChatWidgetProps {
  userId?: number;
  checkInDate?: string;
  checkOutDate?: string;
  location?: string;
  guests?: number;
}

// Bộ phân tích cú pháp Markdown mini để hiển thị nội dung tin nhắn đẹp và rõ ràng
const parseInline = (text: string, isUserMessage: boolean = false) => {
  const parts = text.split(/(\*\*.*?\*\*)/g);
  return parts.map((part, index) => {
    if (part.startsWith('**') && part.endsWith('**')) {
      return (
        <strong key={index} className={`font-semibold ${isUserMessage ? 'text-white underline decoration-white/20' : 'text-blue-700'}`}>
          {part.slice(2, -2)}
        </strong>
      );
    }
    return part;
  });
};

const MarkdownRenderer = ({ text, isUser = false }: { text: string; isUser?: boolean }) => {
  if (!text) return null;

  const lines = text.split('\n');
  const elements: React.ReactNode[] = [];

  let currentList: React.ReactNode[] = [];
  let currentListType: 'ul' | 'ol' | null = null;
  let keyCounter = 0;

  const flushList = () => {
    if (currentListType && currentList.length > 0) {
      const ListTag = currentListType;
      const listClass = currentListType === 'ol'
        ? "list-decimal pl-5 my-1.5 space-y-1 text-sm text-inherit"
        : "list-disc pl-5 my-1.5 space-y-1 text-sm text-inherit";
      elements.push(
        <ListTag key={`list-${keyCounter++}`} className={listClass}>
          {currentList}
        </ListTag>
      );
      currentList = [];
      currentListType = null;
    }
  };

  for (let i = 0; i < lines.length; i++) {
    const line = lines[i];
    const trimmed = line.trim();

    if (!trimmed) {
      flushList();
      elements.push(<div key={`space-${keyCounter++}`} className="h-1.5" />);
      continue;
    }

    // Kiểm tra danh sách có thứ tự (e.g. "1. **Tên khách sạn**")
    const olMatch = line.match(/^(\s*)(\d+)\.\s+(.*)$/);
    if (olMatch) {
      if (currentListType !== 'ol') {
        flushList();
        currentListType = 'ol';
      }
      const content = olMatch[3];
      currentList.push(
        <li key={`li-${keyCounter++}`} className="text-sm leading-relaxed text-inherit">
          {parseInline(content, isUser)}
        </li>
      );
      continue;
    }

    // Kiểm tra danh sách không thứ tự (e.g. "* **Địa chỉ:**")
    const ulMatch = line.match(/^(\s*)([*+-])\s+(.*)$/);
    if (ulMatch) {
      if (currentListType !== 'ul') {
        flushList();
        currentListType = 'ul';
      }
      const content = ulMatch[3];
      currentList.push(
        <li key={`li-${keyCounter++}`} className="text-sm leading-relaxed text-inherit">
          {parseInline(content, isUser)}
        </li>
      );
      continue;
    }

    // Đoạn văn bản thông thường
    flushList();
    elements.push(
      <p key={`p-${keyCounter++}`} className="text-sm leading-relaxed mb-1 text-inherit">
        {parseInline(line, isUser)}
      </p>
    );
  }

  flushList();

  return <div className="markdown-body text-inherit">{elements}</div>;
};

export default function ChatWidget({
  userId,
  checkInDate,
  checkOutDate,
  location,
  guests,
}: ChatWidgetProps) {
  const [isOpen, setIsOpen] = useState(false);
  const [messages, setMessages] = useState<ChatMessage[]>([
    {
      id: 'welcome',
      text: 'Xin chào! 👋 Tôi là trợ lý AI của WanderVN. Tôi có thể giúp bạn tìm kiếm và đặt phòng khách sạn. Bạn cần gì hôm nay?',
      sender: 'bot',
      timestamp: new Date(),
    },
  ]);
  const [inputValue, setInputValue] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const messagesEndRef = useRef<HTMLDivElement>(null);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  const handleSendMessage = async () => {
    if (!inputValue.trim()) return;

    const userMessage: ChatMessage = {
      id: Date.now().toString(),
      text: inputValue,
      sender: 'user',
      timestamp: new Date(),
    };

    setMessages((prev) => [...prev, userMessage]);
    setInputValue('');
    setIsLoading(true);

    try {
      const response = await ChatbotService.sendMessage({
        userId,
        message: inputValue,
        checkInDate,
        checkOutDate,
        location,
        guests,
      });

      if (response?.reply) {
        const botMessage: ChatMessage = {
          id: (Date.now() + 1).toString(),
          text: response.reply,
          sender: 'bot',
          timestamp: new Date(),
          hotelSuggestions: response.hotelSuggestions,
          flightSearchUrl: response.flightSearchUrl,
        };
        setMessages((prev) => [...prev, botMessage]);
      }
    } catch (error) {
      console.error('Error sending message:', error);
      const errorMessage: ChatMessage = {
        id: (Date.now() + 2).toString(),
        text: 'Xin lỗi, đã xảy ra lỗi. Vui lòng thử lại sau.',
        sender: 'bot',
        timestamp: new Date(),
      };
      setMessages((prev) => [...prev, errorMessage]);
    } finally {
      setIsLoading(false);
    }
  };

  const handleKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      handleSendMessage();
    }
  };

  return (
    <div className="fixed bottom-6 right-6 z-50">
      {/* Chat Button */}
      {!isOpen && (
        <button
          onClick={() => setIsOpen(true)}
          className="flex items-center justify-center w-14 h-14 bg-blue-600 text-white rounded-full shadow-lg hover:bg-blue-700 transition-all duration-300 hover:shadow-xl"
          aria-label="Open chat"
        >
          <MessageCircle size={24} />
        </button>
      )}

      {/* Chat Widget */}
      {isOpen && (
        <div className="flex flex-col w-[420px] h-[600px] bg-white rounded-xl shadow-2xl overflow-hidden animate-in fade-in slide-in-from-bottom-2 border border-gray-100">
          {/* Header */}
          <div className="flex items-center justify-between p-4 bg-gradient-to-r from-blue-600 to-blue-700 text-white">
            <div className="flex items-center gap-2">
              <MessageCircle size={20} />
              <h2 className="font-semibold">WanderVN Assistant</h2>
            </div>
            <button
              onClick={() => setIsOpen(false)}
              className="p-1 hover:bg-blue-800 rounded transition-colors"
              aria-label="Close chat"
            >
              <X size={20} />
            </button>
          </div>

          {/* Messages Container */}
          <div className="flex-1 overflow-y-auto p-4 space-y-4 bg-gray-50/50">
            {messages.map((message) => {
              const isUser = message.sender === 'user';
              return (
                <div key={message.id} className={`flex ${isUser ? 'justify-end' : 'justify-start'}`}>
                  <div
                    className={`max-w-[85%] px-4 py-3 rounded-2xl ${
                      isUser
                        ? 'bg-blue-600 text-white rounded-br-none shadow-sm'
                        : 'bg-white text-gray-800 border border-gray-100 shadow-sm rounded-bl-none'
                    }`}
                  >
                    <MarkdownRenderer text={message.text} isUser={isUser} />
                    {message.hotelSuggestions && message.hotelSuggestions.length > 0 && (
                      <div className="mt-3 space-y-2">
                        {message.hotelSuggestions.slice(0, 3).map((hotel) => (
                          <Link
                            key={hotel.hotelId}
                            to={`/hotel/${hotel.hotelId}`}
                            className="block bg-blue-50/50 hover:bg-blue-50 border border-blue-100 p-2.5 rounded-lg text-xs transition-colors"
                          >
                            <p className="font-semibold text-blue-900">{hotel.name}</p>
                            {hotel.address && <p className="text-gray-600 mt-0.5">{hotel.address}</p>}
                            {hotel.price && <p className="text-gray-700 font-medium mt-0.5">Giá: {hotel.price.toLocaleString('vi-VN')} VNĐ/đêm</p>}
                            {hotel.starRating && <p className="text-yellow-500 mt-0.5">{'★'.repeat(hotel.starRating)}</p>}
                          </Link>
                        ))}
                      </div>
                    )}
                    {message.flightSearchUrl && (
                      <div className="mt-3">
                        <a
                          href={message.flightSearchUrl}
                          className="flex items-center gap-2 px-3 py-2 bg-blue-500 hover:bg-blue-600 text-white text-xs font-medium rounded-lg transition-colors"
                        >
                          <Plane size={14} />
                          Tìm chuyến bay ngay
                        </a>
                      </div>
                    )}
                  </div>
                </div>
              );
            })}
            {isLoading && (
              <div className="flex justify-start">
                <div className="bg-white border border-gray-100 shadow-sm px-4 py-3 rounded-2xl rounded-bl-none">
                  <div className="flex gap-1 items-center h-4">
                    <div className="w-2 h-2 bg-blue-600 rounded-full animate-bounce"></div>
                    <div className="w-2 h-2 bg-blue-600 rounded-full animate-bounce delay-100"></div>
                    <div className="w-2 h-2 bg-blue-600 rounded-full animate-bounce delay-200"></div>
                  </div>
                </div>
              </div>
            )}
            <div ref={messagesEndRef} />
          </div>

          {/* Input Area */}
          <div className="border-t p-4 bg-white">
            <div className="flex gap-2">
              <input
                type="text"
                value={inputValue}
                onChange={(e) => setInputValue(e.target.value)}
                onKeyPress={handleKeyPress}
                placeholder="Nhập tin nhắn..."
                disabled={isLoading}
                className="flex-1 px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-600 disabled:bg-gray-100 disabled:cursor-not-allowed"
              />
              <button
                onClick={handleSendMessage}
                disabled={isLoading || !inputValue.trim()}
                className="p-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors disabled:bg-gray-400 disabled:cursor-not-allowed"
                aria-label="Send message"
              >
                <Send size={20} />
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
