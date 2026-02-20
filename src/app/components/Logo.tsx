import React from 'react';

interface LogoProps {
  className?: string;
  size?: number;
}

export function Logo({ className = '', size = 40 }: LogoProps) {
  return (
    <svg
      width={size}
      height={size}
      viewBox="0 0 100 100"
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
      className={className}
    >
      {/* Glow effect */}
      <defs>
        <filter id="glow" x="-50%" y="-50%" width="200%" height="200%">
          <feGaussianBlur stdDeviation="4" result="coloredBlur" />
          <feMerge>
            <feMergeNode in="coloredBlur" />
            <feMergeNode in="SourceGraphic" />
          </feMerge>
        </filter>
      </defs>

      {/* Diamond shape */}
      <g filter="url(#glow)">
        {/* Top facet */}
        <path
          d="M50 15 L70 35 L50 40 L30 35 Z"
          stroke="currentColor"
          strokeWidth="2"
          fill="none"
          strokeLinejoin="miter"
        />
        
        {/* Left facet */}
        <path
          d="M30 35 L50 40 L50 85 L20 45 Z"
          stroke="currentColor"
          strokeWidth="2"
          fill="none"
          strokeLinejoin="miter"
        />
        
        {/* Right facet */}
        <path
          d="M70 35 L50 40 L50 85 L80 45 Z"
          stroke="currentColor"
          strokeWidth="2"
          fill="none"
          strokeLinejoin="miter"
        />
        
        {/* Center vertical line */}
        <line
          x1="50"
          y1="40"
          x2="50"
          y2="85"
          stroke="currentColor"
          strokeWidth="2"
        />
        
        {/* Top left edge */}
        <line
          x1="30"
          y1="35"
          x2="20"
          y2="45"
          stroke="currentColor"
          strokeWidth="2"
        />
        
        {/* Top right edge */}
        <line
          x1="70"
          y1="35"
          x2="80"
          y2="45"
          stroke="currentColor"
          strokeWidth="2"
        />
        
        {/* Bottom edges */}
        <line
          x1="20"
          y1="45"
          x2="50"
          y2="85"
          stroke="currentColor"
          strokeWidth="2"
        />
        <line
          x1="80"
          y1="45"
          x2="50"
          y2="85"
          stroke="currentColor"
          strokeWidth="2"
        />
        
        {/* Horizontal top line */}
        <line
          x1="30"
          y1="35"
          x2="70"
          y2="35"
          stroke="currentColor"
          strokeWidth="2"
        />
      </g>
    </svg>
  );
}
