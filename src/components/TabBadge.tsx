"use client";

import { useEffect } from "react";

export default function TabBadge({ count, title }: { count: number; title: string }) {
  useEffect(() => {
    document.title = count > 0 ? `(${count}) ${title}` : title;
    return () => { document.title = title; };
  }, [count, title]);

  return null;
}
