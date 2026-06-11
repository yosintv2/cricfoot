// Single source of the CricFoot football mark, used by the navbar and footer.
// Keep in sync with app/icon.svg (the favicon), which is the same artwork.
export default function Logo({ size = 40 }: { size?: number }) {
  return (
    <svg width={size} height={size} viewBox="0 0 40 40" fill="none" xmlns="http://www.w3.org/2000/svg" aria-hidden="true">
      <circle cx="20" cy="20" r="19" fill="#b91c1c" />
      <circle cx="20" cy="20" r="19" fill="url(#cf-logo-rg)" />
      <polygon points="20,5 24,13 20,11 16,13" fill="white" opacity="0.85" />
      <polygon points="31,12 27,18 29,23 35,21" fill="white" opacity="0.7" />
      <polygon points="29,30 23,27 20,32 24,36" fill="white" opacity="0.7" />
      <polygon points="11,30 17,27 20,32 16,36" fill="white" opacity="0.7" />
      <polygon points="9,12 13,18 11,23 5,21" fill="white" opacity="0.7" />
      <path d="M8 30 Q20 40 32 30" stroke="white" strokeWidth="1.5" fill="none" opacity="0.4" />
      <circle cx="20" cy="20" r="19" fill="none" stroke="rgba(255,255,255,0.25)" strokeWidth="1" />
      <defs>
        <radialGradient id="cf-logo-rg" cx="38%" cy="30%">
          <stop offset="0%" stopColor="#ef4444" />
          <stop offset="100%" stopColor="#7f1d1d" />
        </radialGradient>
      </defs>
    </svg>
  );
}
