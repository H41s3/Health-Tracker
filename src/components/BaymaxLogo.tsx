// Baymax Eye Logo Component - The iconic healthcare companion
export default function BaymaxLogo({ className = "w-12 h-12" }: { className?: string }) {
  return (
    <svg viewBox="0 0 48 48" className={className} xmlns="http://www.w3.org/2000/svg">
      {/* Baymax face - white rounded pill shape */}
      <rect x="4" y="12" width="40" height="24" rx="12" ry="12" fill="#ffffff"/>
      {/* Subtle shadow for depth */}
      <rect x="4" y="12" width="40" height="24" rx="12" ry="12" fill="none" stroke="#e0e0e0" strokeWidth="0.5"/>
      {/* Left eye */}
      <circle cx="17" cy="24" r="4" fill="#1a1a1a"/>
      {/* Right eye */}
      <circle cx="31" cy="24" r="4" fill="#1a1a1a"/>
      {/* Connecting line between eyes */}
      <line x1="21" y1="24" x2="27" y2="24" stroke="#1a1a1a" strokeWidth="2" strokeLinecap="round"/>
    </svg>
  );
}
