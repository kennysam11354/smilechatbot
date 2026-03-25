'use client';

import { useEffect } from "react";

export default function Home() {
  useEffect(() => {
    // For iframe embedding naturally
    document.documentElement.style.background = 'transparent';
    document.body.style.background = 'transparent';
  }, []);

  // Return nothing, so only the ChatWidget from layout is rendered
  return null;
}
