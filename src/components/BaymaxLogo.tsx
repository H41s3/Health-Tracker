// Baymax Eye Logo Component - Night Owl themed healthcare companion
export default function BaymaxLogo({ className = "w-12 h-12" }: { className?: string }) {
  return (
    <svg viewBox="0 0 48 48" className={className} xmlns="http://www.w3.org/2000/svg">
      {/* Baymax face - Night Owl soft white */}
      <rect x="4" y="12" width="40" height="24" rx="12" ry="12" fill="#d6deeb"/>
      {/* Subtle cyan glow for depth */}
      <rect x="4" y="12" width="40" height="24" rx="12" ry="12" fill="none" stroke="#7fdbca" strokeWidth="0.5" opacity="0.5"/>
      {/* Left eye - Night Owl dark */}
      <circle cx="17" cy="24" r="4" fill="#011627"/>
      {/* Right eye - Night Owl dark */}
      <circle cx="31" cy="24" r="4" fill="#011627"/>
      {/* Connecting line between eyes */}
      <line x1="21" y1="24" x2="27" y2="24" stroke="#011627" strokeWidth="2" strokeLinecap="round"/>
    </svg>
  );
}
