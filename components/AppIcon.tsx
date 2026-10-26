export function AppIcon({ className, size = 28 }: { className?: string; size?: number }) {
  return (
    <svg className={className} width={size} height={size} viewBox="0 0 64 64" aria-hidden="true">
      <defs>
        <linearGradient id="ai-g" x1="0" y1="0" x2="0" y2="1">
          <stop offset="0" stopColor="#FFFFFF" />
          <stop offset="1" stopColor="#F1F4F2" />
        </linearGradient>
      </defs>
      <rect width="64" height="64" rx="14" fill="url(#ai-g)" />
      <path d="M8 20h48M8 32h48M8 44h48M8 56h48" stroke="#D4E5EF" strokeWidth="2" />
      <path d="M17 4v60" stroke="#E8A5A5" strokeWidth="2" />
      <path d="M25 33l7 8 16-19" fill="none" stroke="#12936A" strokeWidth="6.5" strokeLinecap="round" strokeLinejoin="round" />
    </svg>
  );
}
