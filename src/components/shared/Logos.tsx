import React from "react";

export function RefreshingLogo({ className = "h-9 w-auto" }: { className?: string }) {
  return (
    <div className={`flex items-center gap-3 ${className}`}>
      {/* Stylized SVG Flame Graphic matching the brand identity */}
      <svg
        viewBox="0 0 100 100"
        fill="none"
        xmlns="http://www.w3.org/2000/svg"
        className="h-full w-auto"
      >
        <defs>
          <linearGradient id="flameGrad" x1="0%" y1="100%" x2="100%" y2="0%">
            <stop offset="0%" stopColor="#D9541F" />
            <stop offset="60%" stopColor="#E57A3C" />
            <stop offset="100%" stopColor="#C9A227" />
          </linearGradient>
        </defs>
        <circle cx="50" cy="50" r="45" fill="url(#flameGrad)" opacity="0.15" />
        <path
          d="M50 8C50 8 36 26 36 46C36 62 48 76 62 76C76 76 80 62 80 50C80 34 68 28 68 28C68 28 72 38 68 46C64 54 52 54 50 42C48 30 58 20 50 8Z"
          fill="url(#flameGrad)"
        />
        <path
          d="M48 24C48 24 38 38 38 52C38 64 46 72 56 72C66 72 70 64 70 54C70 42 60 36 60 36C60 36 64 42 60 48C56 54 48 54 48 42C48 34 52 28 48 24Z"
          fill="#FFFFFF"
          opacity="0.9"
        />
      </svg>
      <span className="font-sans font-bold tracking-tight text-xl text-foreground">
        REFRESHING
      </span>
    </div>
  );
}

export function LSBSFLogo({ className = "h-12 w-auto" }: { className?: string }) {
  return (
    <div className={`flex items-center gap-3 ${className}`}>
      <svg
        viewBox="0 0 120 120"
        fill="none"
        xmlns="http://www.w3.org/2000/svg"
        className="h-full w-auto"
      >
        <circle cx="60" cy="60" r="54" stroke="#1E5631" strokeWidth="6" fill="#FFFFFF" />
        <circle cx="60" cy="60" r="46" stroke="#84CC16" strokeWidth="2" fill="none" />
        {/* Core elements: Book/Shield/Est 1958 details simplified into SVG paths */}
        <path
          d="M38 55L60 44L82 55V76L60 88L38 76V55Z"
          fill="#1E5631"
          opacity="0.1"
        />
        <path
          d="M38 55L60 44L82 55L60 66L38 55Z"
          stroke="#1E5631"
          strokeWidth="3"
          strokeLinejoin="round"
        />
        <path
          d="M42 58V74C42 74 60 85 60 85C60 85 78 74 78 74V58"
          stroke="#1E5631"
          strokeWidth="3"
          strokeLinejoin="round"
        />
        <path
          d="M60 44V85"
          stroke="#1E5631"
          strokeWidth="2"
        />
        {/* Stylized cap inside the shield */}
        <path
          d="M50 50L60 46L70 50L60 54L50 50Z"
          fill="#15130F"
        />
        <path
          d="M60 54V59"
          stroke="#15130F"
          strokeWidth="1.5"
        />
      </svg>
      <div className="flex flex-col text-left">
        <span className="font-sans font-bold text-xs tracking-wide leading-none text-foreground">
          LSBSF
        </span>
        <span className="font-sans text-[9px] text-foreground-muted leading-tight">
          Lagos State Baptist<br />Student Fellowship
        </span>
      </div>
    </div>
  );
}
