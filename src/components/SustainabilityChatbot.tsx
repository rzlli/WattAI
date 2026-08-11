import React, { useState, useRef, useEffect } from 'react';
import { Bot, Send, User, Sparkles, Loader2, MessageSquare, X, Minimize2, Maximize2 } from 'lucide-react';
import { ChatMessage, CityWeather } from '../types';

interface SustainabilityChatbotProps {
  selectedCity: CityWeather;
}

const QUICK_QUESTIONS = [
  'كيف أمنع دخول فاتورتي في شريحة الـ 30 هللة؟',
  'كيف أتحقق من وجود تسريب خفي بخزان المياه الأرضي؟',
  'ما هو الفرق المالي بين مكيف العادي ومكيف الإنفرتر بالريال؟',
  'ما هي أفضل درجة حرارة للمكيف لترشيد الاستهلاك بالصيف؟',
];

export const SustainabilityChatbot: React.FC<SustainabilityChatbotProps> = ({ selectedCity }) => {
  const [isOpen, setIsOpen] = useState<boolean>(false);
  const [messages, setMessages] = useState<ChatMessage[]>([
    {
      id: '1',
      sender: 'assistant',
      text: `أهلاً بك! أنا خبير الاستدامة والطاقة السعودي الذكي. 🇸🇦⚡\nكيف يمكنني مساعدتك اليوم في تحليل فواتير الكهرباء والمياه، تقييم كفاءة الأجهزة، أو توفير المال بالريال السعودي؟`,
      timestamp: new Date().toLocaleTimeString('ar-SA', { hour: '2-digit', minute: '2-digit' }),
    },
  ]);
  const [inputText, setInputText] = useState<string>('');
  const [loading, setLoading] = useState<boolean>(false);
  const messagesEndRef = useRef<HTMLDivElement>(null);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  useEffect(() => {
    if (isOpen) scrollToBottom();
  }, [messages, isOpen]);

  const handleSendMessage = async (textToSend?: string) => {
    const text = textToSend || inputText;
    if (!text.trim() || loading) return;

    const userMsg: ChatMessage = {
      id: Date.now().toString(),
      sender: 'user',
      text: text.trim(),
      timestamp: new Date().toLocaleTimeString('ar-SA', { hour: '2-digit', minute: '2-digit' }),
    };

    const newMessages = [...messages, userMsg];
    setMessages(newMessages);
    setInputText('');
    setLoading(true);

    try {
      const res = await fetch('/api/chat', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          messages: newMessages,
          cityId: selectedCity.cityId,
        }),
      });
      const data = await res.json();

      const botReply: ChatMessage = {
        id: (Date.now() + 1).toString(),
        sender: 'assistant',
        text: data.reply || 'أهلاً بك! يسعدني إجابتك حول كافة تفاصيل الترشيد والاستدامة بالريال السعودي.',
        timestamp: new Date().toLocaleTimeString('ar-SA', { hour: '2-digit', minute: '2-digit' }),
      };

      setMessages((prev) => [...prev, botReply]);
    } catch (e) {
      setMessages((prev) => [
        ...prev,
        {
          id: Date.now().toString(),
          sender: 'assistant',
          text: 'حدث خطأ مؤقت بالاتصال، يرجى المحاولة مرة أخرى.',
          timestamp: new Date().toLocaleTimeString('ar-SA', { hour: '2-digit', minute: '2-digit' }),
        },
      ]);
    } finally {
      setLoading(false);
    }
  };

  if (!isOpen) {
    return (
      <button
        onClick={() => setIsOpen(true)}
        className="fixed bottom-6 left-6 z-50 bg-gradient-to-r from-emerald-600 to-teal-600 hover:from-emerald-500 hover:to-teal-500 text-white p-4 rounded-full shadow-2xl flex items-center gap-2 border border-emerald-400/40 transition-all cursor-pointer hover:scale-105 active:scale-95 group"
        dir="rtl"
      >
        <div className="relative">
          <Bot className="w-6 h-6 text-white" />
          <span className="absolute -top-1 -right-1 w-2.5 h-2.5 bg-amber-400 rounded-full animate-ping"></span>
        </div>
        <span className="font-bold text-xs pl-1">مساعد خبير الاستدامة</span>
      </button>
    );
  }

  return (
    <div
      className="fixed bottom-6 left-6 z-50 w-[92vw] sm:w-[420px] h-[560px] bg-white rounded-2xl shadow-2xl border border-slate-200 flex flex-col overflow-hidden font-sans"
      dir="rtl"
    >
      {/* Header */}
      <div className="bg-gradient-to-r from-emerald-950 via-teal-950 to-slate-900 text-white p-4 flex items-center justify-between border-b border-emerald-800">
        <div className="flex items-center gap-2.5">
          <div className="w-9 h-9 rounded-xl bg-emerald-500/20 border border-emerald-500/30 flex items-center justify-center text-emerald-400">
            <Bot className="w-5 h-5" />
          </div>
          <div>
            <h3 className="font-bold text-sm text-white">خبير الاستدامة والطاقة السعودي</h3>
            <p className="text-[10px] text-emerald-300">متصل الآن | مدينة {selectedCity.cityNameAr}</p>
          </div>
        </div>

        <button
          onClick={() => setIsOpen(false)}
          className="text-slate-400 hover:text-white p-1 rounded-lg hover:bg-slate-800 transition-all cursor-pointer"
        >
          <X className="w-5 h-5" />
        </button>
      </div>

      {/* Messages Scroll Area */}
      <div className="flex-1 p-4 overflow-y-auto space-y-3 bg-slate-50/60">
        {messages.map((msg) => (
          <div
            key={msg.id}
            className={`flex items-start gap-2.5 ${msg.sender === 'user' ? 'flex-row-reverse' : ''}`}
          >
            <div
              className={`w-7 h-7 rounded-full flex items-center justify-center shrink-0 text-xs ${
                msg.sender === 'user' ? 'bg-slate-900 text-white' : 'bg-emerald-600 text-white'
              }`}
            >
              {msg.sender === 'user' ? <User className="w-4 h-4" /> : <Bot className="w-4 h-4" />}
            </div>

            <div
              className={`max-w-[80%] p-3 rounded-2xl text-xs leading-relaxed ${
                msg.sender === 'user'
                  ? 'bg-slate-900 text-white rounded-tr-none'
                  : 'bg-white border border-slate-200 text-slate-800 shadow-sm rounded-tl-none'
              }`}
            >
              <p className="whitespace-pre-line">{msg.text}</p>
              <div
                className={`text-[9px] mt-1 text-left ${
                  msg.sender === 'user' ? 'text-slate-400' : 'text-slate-400'
                }`}
              >
                {msg.timestamp}
              </div>
            </div>
          </div>
        ))}

        {loading && (
          <div className="flex items-center gap-2 text-slate-500 text-xs p-2 bg-white rounded-xl border border-slate-200 w-fit">
            <Loader2 className="w-4 h-4 animate-spin text-emerald-600" />
            <span>جاري تحليل استفسارك...</span>
          </div>
        )}

        <div ref={messagesEndRef} />
      </div>

      {/* Quick Question Chips */}
      <div className="px-3 py-2 bg-white border-t border-slate-100 flex items-center gap-1.5 overflow-x-auto text-[10px]">
        {QUICK_QUESTIONS.map((q, idx) => (
          <button
            key={idx}
            onClick={() => handleSendMessage(q)}
            className="whitespace-nowrap bg-emerald-50 hover:bg-emerald-100 text-emerald-800 border border-emerald-200 px-2.5 py-1 rounded-full font-medium cursor-pointer transition-all shrink-0"
          >
            {q}
          </button>
        ))}
      </div>

      {/* Input Box */}
      <form
        onSubmit={(e) => {
          e.preventDefault();
          handleSendMessage();
        }}
        className="p-3 bg-white border-t border-slate-200 flex items-center gap-2"
      >
        <input
          type="text"
          value={inputText}
          onChange={(e) => setInputText(e.target.value)}
          placeholder="اسأل خبير الاستدامة (مثل: كيف أوفر الفاتورة؟)"
          className="flex-1 bg-slate-50 border border-slate-200 rounded-xl px-3 py-2 text-xs text-slate-900 focus:outline-none focus:ring-2 focus:ring-emerald-500"
        />
        <button
          type="submit"
          disabled={!inputText.trim() || loading}
          className="bg-emerald-600 hover:bg-emerald-700 text-white p-2 rounded-xl transition-all disabled:opacity-40 cursor-pointer"
        >
          <Send className="w-4 h-4" />
        </button>
      </form>
    </div>
  );
};
