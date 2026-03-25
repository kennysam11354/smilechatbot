'use client';
import ChatWidget from '@/components/chat/ChatWidget';
import { useEffect } from 'react';

export default function EmbedPage() {
  useEffect(() => {
    // Make body transparent
    document.documentElement.style.background = 'transparent';
    document.body.style.background = 'transparent';
  }, []);

  return (
    // Only the chat widget itself gets pointer-events, rest is transparent
    <div style={{ pointerEvents: 'auto', display: 'flex', justifyContent: 'flex-end', height: '100%', width: '100%' }}>
      <ChatWidget />
    </div>
  );
}
