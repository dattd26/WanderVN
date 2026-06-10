import { useState, useRef, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { MessageCircle, X, Send, Plane } from 'lucide-react';
import { gsap } from 'gsap';
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
        <strong key={index} className={`font-semibold ${isUserMessage ? 'text-white underline decoration-white/20' : 'text-blue-700 dark:text-blue-400'}`}>
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
      text: 'Xin chào! 👋 Tôi là trợ lý AI của WanderVN. Tôi có thể giúp bạn tìm kiếm khách sạn và đặt vé máy bay trên toàn Việt Nam. Bạn cần gì hôm nay?',
      sender: 'bot',
      timestamp: new Date(),
    },
  ]);
  const [inputValue, setInputValue] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const messagesEndRef = useRef<HTMLDivElement>(null);

  const chatWindowRef = useRef<HTMLDivElement>(null);
  const triggerButtonRef = useRef<HTMLButtonElement>(null);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  // Load lịch sử trò chuyện khi mở widget và có userId
  useEffect(() => {
    if (!userId || !isOpen) return;

    const loadHistory = async () => {
      try {
        const historyData = await ChatbotService.getConversationHistory(userId, 30);
        if (historyData && historyData.length > 0) {
          const formattedHistory: ChatMessage[] = historyData.map((msg, index) => ({
            id: `history-${index}-${msg.sentAt}`,
            text: msg.text || '',
            sender: msg.isFromBot ? 'bot' : 'user',
            timestamp: msg.sentAt ? new Date(msg.sentAt) : new Date(),
          }));

          setMessages([
            {
              id: 'welcome',
              text: 'Xin chào! 👋 Tôi là trợ lý AI của WanderVN. Tôi có thể giúp bạn tìm kiếm khách sạn và đặt vé máy bay trên toàn Việt Nam. Bạn cần gì hôm nay?',
              sender: 'bot',
              timestamp: new Date(),
            },
            ...formattedHistory
          ]);
        }
      } catch (error) {
        console.error('Lỗi khi tải lịch sử chat:', error);
      }
    };

    loadHistory();
  }, [userId, isOpen]);

  // GSAP transition hiệu ứng đóng mở và floating button
  useEffect(() => {
    if (!chatWindowRef.current || !triggerButtonRef.current) return;

    if (isOpen) {
      // Ẩn trigger button mượt mà bằng GSAP
      gsap.to(triggerButtonRef.current, {
        scale: 0.6,
        autoAlpha: 0,
        duration: 0.35,
        ease: "power2.inOut"
      });

      // Hiện chat window với hiệu ứng trồi lên và đàn hồi nhẹ (neumorphic feel)
      gsap.fromTo(chatWindowRef.current,
        { scale: 0.8, y: 40, autoAlpha: 0, rotation: -1.5 },
        { scale: 1, y: 0, autoAlpha: 1, rotation: 0, duration: 0.5, ease: "back.out(1.4)" }
      );
    } else {
      // Hiện lại trigger button
      gsap.to(triggerButtonRef.current, {
        scale: 1,
        autoAlpha: 1,
        duration: 0.35,
        ease: "power2.out"
      });

      // Ẩn chat window
      gsap.to(chatWindowRef.current, {
        scale: 0.8,
        y: 40,
        autoAlpha: 0,
        rotation: 1.5,
        duration: 0.4,
        ease: "power2.inOut"
      });
    }
  }, [isOpen]);

  // Hiệu ứng float nhấp nhô vô hạn cho nút trigger khi đang đóng
  useEffect(() => {
    if (!triggerButtonRef.current) return;

    const floatTween = gsap.to(triggerButtonRef.current, {
      y: -6,
      duration: 2,
      repeat: -1,
      yoyo: true,
      ease: "sine.inOut"
    });

    return () => {
      floatTween.kill();
    };
  }, []);

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
    <div className="fixed bottom-6 right-6 z-50 flex flex-col items-end font-sans">
      {/* Trigger Button (Lọc hiệu ứng Soft UI nổi bật) */}
      <button
        ref={triggerButtonRef}
        onClick={() => setIsOpen(true)}
        className="flex items-center justify-center w-14 h-14 bg-gradient-to-br from-blue-500 to-indigo-600 text-white rounded-full border border-blue-400/20 shadow-[4px_4px_10px_rgba(37,99,235,0.35),_-4px_-4px_10px_rgba(255,255,255,0.8),inset_0_1px_1px_rgba(255,255,255,0.4)] hover:from-blue-600 hover:to-indigo-700 hover:shadow-[5px_5px_12px_rgba(37,99,235,0.45)] transition-all duration-300 active:scale-[0.95] z-10 cursor-pointer"
        aria-label="Open chat"
      >
        <MessageCircle size={24} />
      </button>

      {/* Chat Window (Glassmorphic Container kết hợp Neumorphic Shadows) */}
      <div
        ref={chatWindowRef}
        className={`absolute bottom-0 right-0 flex flex-col w-[420px] h-[600px] bg-white/80 dark:bg-slate-900/80 backdrop-blur-xl rounded-2xl border border-white/20 dark:border-slate-800/50 shadow-[8px_8px_18px_rgba(163,177,198,0.25),_-8px_-8px_18px_rgba(255,255,255,0.7),inset_0_1px_2px_rgba(255,255,255,0.4)] dark:shadow-[8px_8px_18px_rgba(0,0,0,0.5),_-8px_-8px_18px_rgba(255,255,255,0.05),inset_0_1px_1px_rgba(255,255,255,0.1)] overflow-hidden ${isOpen ? 'pointer-events-auto' : 'pointer-events-none'
          }`}
        style={{ opacity: 0, visibility: 'hidden', transformOrigin: 'bottom right' }}
      >
        {/* Header */}
        <div className="flex items-center justify-between p-4 bg-gradient-to-r from-blue-600/90 via-blue-700/90 to-indigo-600/90 text-white border-b border-white/10 shadow-[0_2px_8px_rgba(37,99,235,0.15)]">
          <div className="flex items-center gap-2">
            <MessageCircle size={20} className="animate-pulse" />
            <h2 className="font-semibold tracking-tight text-sm">WanderVN Assistant</h2>
          </div>
          <button
            onClick={() => setIsOpen(false)}
            className="p-1.5 hover:bg-white/10 rounded-lg transition-colors cursor-pointer"
            aria-label="Close chat"
          >
            <X size={18} />
          </button>
        </div>

        {/* Messages Area */}
        <div className="flex-1 overflow-y-auto p-4 space-y-4 bg-gray-50/40 dark:bg-slate-950/40 scrollbar-thin scrollbar-thumb-gray-200 dark:scrollbar-thumb-slate-850 scrollbar-track-transparent">
          {messages.map((message) => {
            const isUser = message.sender === 'user';
            return (
              <div key={message.id} className={`flex ${isUser ? 'justify-end' : 'justify-start'}`}>
                <div
                  className={`chat-bubble-anim max-w-[85%] px-4 py-3 rounded-2xl ${isUser
                    ? 'bg-gradient-to-br from-blue-500 to-indigo-600 text-white rounded-br-none shadow-[3px_3px_8px_rgba(37,99,235,0.25),_inset_0_1px_1px_rgba(255,255,255,0.3)] border border-blue-400/20'
                    : 'bg-white/95 dark:bg-slate-800/95 text-gray-800 dark:text-gray-100 border border-white/20 dark:border-slate-700/50 shadow-[3px_3px_8px_rgba(163,177,198,0.15)] dark:shadow-[3px_3px_8px_rgba(0,0,0,0.35),_inset_0_1px_1px_rgba(255,255,255,0.1)] rounded-bl-none'
                    }`}
                >
                  <MarkdownRenderer text={message.text} isUser={isUser} />
                  {message.hotelSuggestions && message.hotelSuggestions.length > 0 && (
                    <div className="mt-3 space-y-2">
                      {message.hotelSuggestions.slice(0, 3).map((hotel) => (
                        <Link
                          key={hotel.hotelId}
                          to={`/hotel/${hotel.hotelId}`}
                          className="block bg-gradient-to-br from-blue-50/70 to-blue-100/30 hover:from-blue-100/70 hover:to-blue-100/50 dark:from-slate-800/60 dark:to-slate-800/30 dark:hover:from-slate-800/80 dark:hover:to-slate-800/50 border border-blue-200/30 dark:border-slate-700/50 p-3 rounded-xl text-xs transition-all duration-300 shadow-[2px_2px_6px_rgba(163,177,198,0.15)] dark:shadow-[2px_2px_6px_rgba(0,0,0,0.2)] hover:shadow-[3px_3px_8px_rgba(163,177,198,0.2)] dark:hover:shadow-[3px_3px_8px_rgba(0,0,0,0.3)] hover:-translate-y-0.5"
                        >
                          <p className="font-semibold text-blue-900 dark:text-blue-300">{hotel.name}</p>
                          {hotel.address && <p className="text-gray-600 dark:text-gray-400 mt-0.5">{hotel.address}</p>}
                          {hotel.price && <p className="text-gray-700 dark:text-gray-300 font-medium mt-0.5">Giá: {hotel.price.toLocaleString('vi-VN')} VNĐ/đêm</p>}
                          {hotel.starRating && <p className="text-yellow-500 mt-0.5">{'★'.repeat(hotel.starRating)}</p>}
                        </Link>
                      ))}
                    </div>
                  )}
                  {message.flightSearchUrl && (
                    <div className="mt-3">
                      <a
                        href={message.flightSearchUrl}
                        className="flex items-center justify-center gap-2 px-4 py-2.5 bg-gradient-to-r from-blue-500 to-indigo-600 hover:from-blue-600 hover:to-indigo-700 text-white text-xs font-semibold rounded-xl transition-all duration-300 shadow-[0_4px_12px_rgba(37,99,235,0.3)] hover:shadow-[0_6px_16px_rgba(37,99,235,0.4)] hover:-translate-y-0.5 active:scale-[0.98]"
                      >
                        <Plane size={14} className="rotate-[45deg]" />
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
              <div className="bg-white/90 dark:bg-slate-800/90 border border-white/20 dark:border-slate-700/50 shadow-[3px_3px_8px_rgba(163,177,198,0.15)] dark:shadow-[3px_3px_8px_rgba(0,0,0,0.35)] px-4 py-3 rounded-2xl rounded-bl-none">
                <div className="flex gap-1 items-center h-4">
                  <div className="w-2 h-2 bg-blue-500 rounded-full animate-bounce"></div>
                  <div className="w-2 h-2 bg-blue-500 rounded-full animate-bounce delay-100"></div>
                  <div className="w-2 h-2 bg-blue-500 rounded-full animate-bounce delay-200"></div>
                </div>
              </div>
            </div>
          )}
          <div ref={messagesEndRef} />
        </div>

        {/* Input Area */}
        <div className="border-t border-gray-100/50 dark:border-slate-800/50 p-4 bg-white/80 dark:bg-slate-900/80 backdrop-blur-md">
          <div className="flex gap-2">
            <input
              type="text"
              value={inputValue}
              onChange={(e) => setInputValue(e.target.value)}
              onKeyPress={handleKeyPress}
              placeholder="Nhập tin nhắn..."
              disabled={isLoading}
              className="flex-1 px-4 py-2.5 bg-slate-50/70 dark:bg-slate-950/70 border border-gray-200/80 dark:border-slate-800/80 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500/50 focus:border-blue-500 text-sm dark:text-white shadow-[inset_2px_2px_4px_rgba(0,0,0,0.03)] dark:shadow-[inset_2px_2px_4px_rgba(0,0,0,0.2)] transition-all placeholder:text-gray-400 dark:placeholder:text-gray-500"
            />
            <button
              onClick={handleSendMessage}
              disabled={isLoading || !inputValue.trim()}
              className="p-2.5 bg-gradient-to-br from-blue-500 to-indigo-600 text-white rounded-xl hover:from-blue-600 hover:to-indigo-700 shadow-[3px_3px_6px_rgba(37,99,235,0.25),_inset_0_1px_1px_rgba(255,255,255,0.3)] transition-all duration-300 active:scale-[0.95] disabled:from-gray-300 disabled:to-gray-400 disabled:shadow-none flex items-center justify-center cursor-pointer"
              aria-label="Send message"
            >
              <Send size={18} />
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
