// Single source of the CricFoot mark (red rounded square, circle + play),
// used by the navbar and footer. Keep in sync with app/icon.svg (the favicon).
export default function Logo({ size = 40 }: { size?: number }) {
  return (
    <svg width={size} height={size} viewBox="0 0 40 40" fill="none" xmlns="http://www.w3.org/2000/svg" aria-hidden="true">
      <rect width="40" height="40" rx="9" fill="url(#cf-logo-g)" />
      <circle cx="20" cy="20" r="12" stroke="white" strokeWidth="2.8" fill="none" />
      <polygon points="17,15 26,20 17,25" fill="white" />
      <defs>
        <linearGradient id="cf-logo-g" x1="0" y1="0" x2="40" y2="40">
          <stop offset="0%" stopColor="#dc2626" />
          <stop offset="100%" stopColor="#991b1b" />
        </linearGradient>
      </defs>
    </svg>
  );
}
