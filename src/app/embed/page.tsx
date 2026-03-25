'use client';
import ChatWidget from '@/components/chat/ChatWidget';
import { useEffect } from 'react';

export default function EmbedPage() {
  useEffect(() => {
    // Make body transparent and pass-through clicks
    document.documentElement.style.background = 'transparent';
    document.body.style.background = 'transparent';
    document.body.style.pointerEvents = 'none';
  }, []);

  return (
    // Only the chat widget itself gets pointer-events, rest is transparent
    <div style={{ pointerEvents: 'auto', display: 'inline-block' }}>
      <ChatWidget />
    </div>
  );
}
