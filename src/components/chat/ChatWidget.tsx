'use client';

import { useState, useEffect, useRef, useCallback } from 'react';
import { MessageCircle, X, Send, User, Bot, Minimize2 } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import { clsx, type ClassValue } from 'clsx';
import { twMerge } from 'tailwind-merge';

function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

type Message = {
  id: string;
  role: 'user' | 'assistant';
  content: string;
};

export default function ChatWidget() {
  const [isOpen, setIsOpen] = useState(false);
  const [hideControl, setHideControl] = useState(false);
  const [messages, setMessages] = useState<Message[]>([]);
  const [input, setInput] = useState('');

  useEffect(() => {
    // URL에 파라미터가 있으면 초기 상태 설정
    const searchParams = new URLSearchParams(window.location.search);
    if (searchParams.get('autoOpen') === 'true') {
      setIsOpen(true);
    }
    if (searchParams.get('hideControl') === 'true') {
      setHideControl(true);
    }
  }, []);
  const [isLoading, setIsLoading] = useState(false);
  const scrollRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLInputElement>(null);
  const abortRef = useRef<AbortController | null>(null);

  // Auto-scroll to bottom
  useEffect(() => {
    if (scrollRef.current) {
      scrollRef.current.scrollTop = scrollRef.current.scrollHeight;
    }
  }, [messages, isLoading]);



  const sendMessage = useCallback(async (e?: React.FormEvent) => {
    e?.preventDefault();
    const text = input.trim();
    if (!text || isLoading) return;

    const userMessage: Message = {
      id: Date.now().toString(),
      role: 'user',
      content: text,
    };

    const updatedMessages = [...messages, userMessage];
    setMessages(updatedMessages);
    setInput('');
    setIsLoading(true);

    const controller = new AbortController();
    abortRef.current = controller;

    try {
      const res = await fetch('/api/chat', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ messages: updatedMessages.map(m => ({ role: m.role, content: m.content })) }),
        signal: controller.signal,
      });

      if (!res.ok || !res.body) throw new Error('Network error');

      // Stream the response
      const reader = res.body.getReader();
      const decoder = new TextDecoder();
      const assistantId = (Date.now() + 1).toString();
      let fullText = '';

      setMessages(prev => [...prev, { id: assistantId, role: 'assistant', content: '' }]);

      while (true) {
        const { done, value } = await reader.read();
        if (done) break;

        const chunk = decoder.decode(value, { stream: true });
        // Parse Vercel AI SDK data stream format  (0:"text" lines)
        const lines = chunk.split('\n');
        for (const line of lines) {
          if (line.startsWith('0:')) {
            try {
              const parsed = JSON.parse(line.slice(2));
              fullText += parsed;
              setMessages(prev =>
                prev.map(m => m.id === assistantId ? { ...m, content: fullText } : m)
              );
            } catch {}
          }
        }
      }
    } catch (err) {
      if (err instanceof Error && err.name !== 'AbortError') {
        setMessages(prev => [...prev, {
          id: Date.now().toString(),
          role: 'assistant',
          content: 'Sorry, an error occurred. Please try again or contact us at (917) 818-0994.',
        }]);
      }
    } finally {
      setIsLoading(false);
      abortRef.current = null;
      // Focus back after loading
      setTimeout(() => inputRef.current?.focus(), 0);
    }
  }, [input, messages, isLoading]);

  return (
    <div className="fixed bottom-5 right-5 z-[9999] flex flex-col items-end">
      {/* Chat Window */}
      <AnimatePresence>
        {isOpen && (
          <motion.div
            initial={{ opacity: 0, y: 20, scale: 0.95 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: 20, scale: 0.95 }}
            className="mb-4 flex h-[600px] w-[400px] flex-col overflow-hidden rounded-2xl bg-white shadow-2xl border border-gray-100"
            style={{ maxWidth: 'calc(100vw - 40px)', maxHeight: '80vh', colorScheme: 'light' }}
          >
            {/* Header */}
            <div className="flex items-center justify-between bg-[#1e3a8a] p-4 text-white">
              <div className="flex items-center gap-3">
                <div className="flex h-8 w-8 items-center justify-center rounded-full bg-white/10">
                  <Bot size={20} />
                </div>
                <div>
                  <h3 className="text-sm font-semibold">Smile Handyman Assistant</h3>
                  <p className="text-[10px] opacity-80 text-blue-100 italic">Always here to help you</p>
                </div>
              </div>
              <button
                onClick={() => setIsOpen(false)}
                className="rounded-full p-1 transition-colors hover:bg-white/20"
              >
                <Minimize2 size={18} />
              </button>
            </div>

            {/* Messages Area */}
            <div ref={scrollRef} className="flex-1 overflow-y-auto bg-gray-50 p-4 space-y-4">
              {messages.length === 0 && (
                <div className="flex flex-col items-center justify-center h-full text-center p-6 space-y-3 opacity-60">
                  <Bot size={40} className="text-[#1e3a8a] mb-2" />
                  <p className="text-sm font-medium">Hello! How can I help you today?</p>
                  <p className="text-xs">Ask about our services, pricing, or how to book.</p>
                </div>
              )}
              {messages.map((m) => (
                <div
                  key={m.id}
                  className={cn(
                    'flex gap-2',
                    m.role === 'user' ? 'ml-auto flex-row-reverse max-w-[85%]' : 'mr-auto max-w-[85%]'
                  )}
                >
                  <div className={cn(
                    'flex h-8 w-8 shrink-0 items-center justify-center rounded-full text-white',
                    m.role === 'user' ? 'bg-gray-400' : 'bg-[#1e3a8a]'
                  )}>
                    {m.role === 'user' ? <User size={16} /> : <Bot size={16} />}
                  </div>
                  <div className={cn(
                    'rounded-2xl px-4 py-2 text-sm shadow-sm whitespace-pre-wrap',
                    m.role === 'user'
                      ? 'bg-[#1e3a8a] text-white rounded-tr-none'
                      : 'bg-white text-gray-800 border border-gray-100 rounded-tl-none'
                  )}>
                    {m.content}
                  </div>
                </div>
              ))}
              {isLoading && (
                <div className="flex gap-2 mr-auto">
                  <div className="flex h-8 w-8 shrink-0 items-center justify-center rounded-full bg-[#1e3a8a] text-white animate-pulse">
                    <Bot size={16} />
                  </div>
                  <div className="bg-white border border-gray-100 rounded-2xl rounded-tl-none px-4 py-3 shadow-sm">
                    <span className="flex gap-1 items-center">
                      <span className="h-1.5 w-1.5 bg-gray-300 rounded-full animate-bounce [animation-delay:-0.3s]"></span>
                      <span className="h-1.5 w-1.5 bg-gray-300 rounded-full animate-bounce [animation-delay:-0.15s]"></span>
                      <span className="h-1.5 w-1.5 bg-gray-300 rounded-full animate-bounce"></span>
                    </span>
                  </div>
                </div>
              )}
            </div>

            {/* Input Area */}
            <form onSubmit={sendMessage} className="border-t bg-white p-4">
              <div className="flex gap-2">
                <input
                  ref={inputRef}
                  autoFocus
                  id="chat-input"
                  value={input}
                  onChange={e => setInput(e.target.value)}
                  placeholder="Ask a question..."
                  disabled={isLoading}
                  className="w-full rounded-full border border-gray-200 px-4 py-2 text-sm outline-none transition-all focus:border-[#1e3a8a] focus:ring-1 focus:ring-[#1e3a8a] disabled:opacity-50"
                  style={{ color: '#111827', backgroundColor: '#f9fafb', colorScheme: 'light' }}
                />
                <button
                  type="submit"
                  disabled={!input.trim() || isLoading}
                  className="flex h-9 w-9 items-center justify-center rounded-full bg-[#1e3a8a] text-white transition-all hover:bg-blue-800 disabled:opacity-40"
                >
                  <Send size={16} />
                </button>
              </div>
              <p className="mt-2 text-center text-[10px] text-gray-400">
                Smile Handyman Support • Manhattan, NY
              </p>
            </form>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Toggle Button */}
      {!hideControl && (
        <motion.button
          whileHover={{ scale: 1.05 }}
          whileTap={{ scale: 0.95 }}
          onClick={() => setIsOpen(!isOpen)}
          className={cn(
            'flex h-14 w-14 items-center justify-center rounded-full shadow-lg transition-colors duration-300 focus:outline-none',
            isOpen ? 'bg-gray-100 text-gray-600' : 'bg-[#1e3a8a] text-white'
          )}
        >
          {isOpen ? <X size={24} /> : <MessageCircle size={28} />}
        </motion.button>
      )}
    </div>
  );
}
