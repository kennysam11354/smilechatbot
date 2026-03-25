'use client';

import { useChat } from 'ai/react';
import { useState, useEffect, useRef } from 'react';
import { MessageCircle, X, Send, User, Bot, Minimize2 } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import { clsx, type ClassValue } from 'clsx';
import { twMerge } from 'tailwind-merge';

// Helper for tailwind classes
function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

export default function ChatWidget() {
  const [isOpen, setIsOpen] = useState(false);
  const { messages, input, handleInputChange, handleSubmit, isLoading } = useChat();
  const scrollRef = useRef<HTMLDivElement>(null);

  // Auto-scroll to bottom of messages
  useEffect(() => {
    if (scrollRef.current) {
      scrollRef.current.scrollTop = scrollRef.current.scrollHeight;
    }
  }, [messages]);

  return (
    <div className="fixed bottom-5 right-5 z-[9999] flex flex-col items-end">
      {/* Chat Window */}
      <AnimatePresence>
        {isOpen && (
          <motion.div
            initial={{ opacity: 0, y: 20, scale: 0.95 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: 20, scale: 0.95 }}
            className="mb-4 flex h-[600px] w-[400px] flex-col overflow-hidden rounded-2xl bg-white shadow-2xl border border-gray-100 max-sm:w-[calc(100vw-40px)] max-sm:h-[80vh]"
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
            <div 
              ref={scrollRef}
              className="flex-1 overflow-y-auto bg-gray-50 p-4 space-y-4"
            >
              {messages.length === 0 && (
                <div className="flex flex-col items-center justify-center h-full text-center p-6 space-y-3 opacity-60">
                  <Bot size={40} className="text-[#1e3a8a] mb-2" />
                  <p className="text-sm font-medium">Hello! How can I help you today?</p>
                  <p className="text-xs">Ask about our services, pricing, or locations in Manhattan.</p>
                </div>
              )}
              {messages.map((m) => (
                <div 
                  key={m.id} 
                  className={cn(
                    "flex gap-2 max-w-[85%]",
                    m.role === 'user' ? "ml-auto flex-row-reverse" : "mr-auto"
                  )}
                >
                  <div className={cn(
                    "flex h-8 w-8 shrink-0 items-center justify-center rounded-full text-white",
                    m.role === 'user' ? "bg-gray-400" : "bg-[#1e3a8a]"
                  )}>
                    {m.role === 'user' ? <User size={16} /> : <Bot size={16} />}
                  </div>
                  <div className={cn(
                    "rounded-2xl px-4 py-2 text-sm shadow-sm",
                    m.role === 'user' ? "bg-[#1e3a8a] text-white rounded-tr-none" : "bg-white text-gray-800 border border-gray-100 rounded-tl-none line-height-relaxed"
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
                    <div className="bg-white border border-gray-100 rounded-2xl rounded-tl-none px-4 py-2 shadow-sm">
                        <span className="flex gap-1">
                            <span className="h-1.5 w-1.5 bg-gray-300 rounded-full animate-bounce [animation-delay:-0.3s]"></span>
                            <span className="h-1.5 w-1.5 bg-gray-300 rounded-full animate-bounce [animation-delay:-0.15s]"></span>
                            <span className="h-1.5 w-1.5 bg-gray-300 rounded-full animate-bounce"></span>
                        </span>
                    </div>
                </div>
              )}
            </div>

            {/* Input Area */}
            <form 
              onSubmit={handleSubmit}
              className="border-t bg-white p-4"
            >
              <div className="flex gap-2 relative">
                <input
                  value={input}
                  onChange={handleInputChange}
                  placeholder="Ask a question..."
                  className="w-full rounded-full border border-gray-200 bg-gray-50 px-4 py-2 text-sm outline-none transition-all focus:border-[#1e3a8a] focus:ring-1 focus:ring-[#1e3a8a]"
                />
                <button 
                  type="submit"
                  disabled={!input.trim() || isLoading}
                  className="flex h-9 w-9 items-center justify-center rounded-full bg-[#1e3a8a] text-white transition-all hover:bg-blue-800 disabled:opacity-40"
                >
                  <Send size={18} />
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
      <motion.button
        whileHover={{ scale: 1.05 }}
        whileTap={{ scale: 0.95 }}
        onClick={() => setIsOpen(!isOpen)}
        className={cn(
          "flex h-14 w-14 items-center justify-center rounded-full shadow-lg transition-colors duration-300 focus:outline-none",
          isOpen ? "bg-gray-100 text-gray-600" : "bg-[#1e3a8a] text-white"
        )}
      >
        {isOpen ? <X size={24} /> : <MessageCircle size={28} />}
      </motion.button>
    </div>
  );
}
