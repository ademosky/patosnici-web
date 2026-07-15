"use client";

import { useState } from "react";

export default function FacebookFloat() {
  const [hovered, setHovered] = useState(false);

  return (
    <a
      href="https://www.facebook.com/patosnici"
      target="_blank"
      rel="noopener noreferrer"
      onMouseEnter={() => setHovered(true)}
      onMouseLeave={() => setHovered(false)}
      className="fixed bottom-6 left-6 z-50 flex items-center gap-3 overflow-hidden rounded-full shadow-2xl transition-all duration-300"
      style={{
        background: "#1877F2",
        boxShadow: "0 4px 24px rgba(24,119,242,0.5)",
        maxWidth: hovered ? "220px" : "52px",
      }}
      aria-label="Facebook страна"
    >
      {/* Facebook icon */}
      <div className="flex h-13 w-13 flex-shrink-0 items-center justify-center rounded-full p-3.5">
        <svg width="26" height="26" viewBox="0 0 24 24" fill="white">
          <path d="M24 12.073C24 5.405 18.627 0 12 0S0 5.405 0 12.073C0 18.1 4.388 23.094 10.125 24v-8.437H7.078v-3.49h3.047V9.41c0-3.025 1.792-4.697 4.533-4.697 1.312 0 2.686.236 2.686.236v2.97h-1.513c-1.491 0-1.956.93-1.956 1.887v2.267h3.328l-.532 3.49h-2.796V24C19.612 23.094 24 18.1 24 12.073z"/>
        </svg>
      </div>

      {/* Label — се прикажува на hover */}
      <span
        className="whitespace-nowrap pr-4 text-sm font-semibold text-white transition-all duration-300"
        style={{ opacity: hovered ? 1 : 0 }}
      >
        Следи не на Facebook
      </span>
    </a>
  );
}
