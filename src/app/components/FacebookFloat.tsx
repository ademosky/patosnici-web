import Link from "next/link";

export default function FacebookFloat() {
  return (
    <Link
      href="https://www.facebook.com/patosnici"
      target="_blank"
      rel="noopener noreferrer"
      aria-label="Facebook страна"
      className="group fixed bottom-6 left-6 z-50 flex h-14 w-14 items-center justify-center rounded-full shadow-2xl transition-transform hover:scale-110 active:scale-95"
      style={{ background: "#1877F2", boxShadow: "0 4px 24px rgba(24,119,242,0.45)" }}
    >
      {/* Facebook icon */}
      <svg width="26" height="26" viewBox="0 0 24 24" fill="white">
        <path d="M24 12.073C24 5.405 18.627 0 12 0S0 5.405 0 12.073C0 18.1 4.388 23.094 10.125 24v-8.437H7.078v-3.49h3.047V9.41c0-3.025 1.792-4.697 4.533-4.697 1.312 0 2.686.236 2.686.236v2.97h-1.513c-1.491 0-1.956.93-1.956 1.887v2.267h3.328l-.532 3.49h-2.796V24C19.612 23.094 24 18.1 24 12.073z"/>
      </svg>

      {/* Tooltip — само на desktop hover */}
      <span className="pointer-events-none absolute left-16 whitespace-nowrap rounded-xl bg-zinc-900 px-3 py-2 text-xs font-semibold text-white opacity-0 shadow-lg transition-opacity group-hover:opacity-100">
        Следи не на Facebook
        <span className="absolute left-0 top-1/2 -translate-x-1 -translate-y-1/2 border-4 border-transparent border-r-zinc-900" />
      </span>
    </Link>
  );
}
