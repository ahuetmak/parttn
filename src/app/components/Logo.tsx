import React from 'react';

interface LogoProps {
  className?: string;
  size?: number;
  variant?: 'icon' | 'glow' | 'full';
  withGlow?: boolean;
}

// Logo SVG fiel al original: diamante rotado 45° con T interior + glow neón cian
export function Logo({ className = '', size = 40, variant = 'icon', withGlow = false }: LogoProps) {
  // Variante con imagen PNG real (máximo impacto visual)
  if (variant === 'glow') {
    return (
      <img
        src="/logo-glow.png"
        alt="PARTTH"
        width={size}
        height={size}
        className={className}
        style={{ objectFit: 'contain' }}
        draggable={false}
      />
    );
  }

  if (variant === 'full') {
    return (
      <div className={`flex items-center gap-2 ${className}`}>
        <LogoSVG size={size} withGlow={withGlow} />
        <span
          className="font-black tracking-widest"
          style={{
            fontSize: size * 0.55,
            background: 'linear-gradient(135deg, #ffffff 0%, #00F2A6 100%)',
            WebkitBackgroundClip: 'text',
            WebkitTextFillColor: 'transparent',
            backgroundClip: 'text',
          }}
        >
          PARTTH
        </span>
      </div>
    );
  }

  return <LogoSVG size={size} withGlow={withGlow} className={className} />;
}

function LogoSVG({ size = 40, withGlow = false, className = '' }: { size?: number; withGlow?: boolean; className?: string }) {
  const id = React.useId().replace(/:/g, '');
  return (
    <svg
      width={size}
      height={size}
      viewBox="0 0 100 100"
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
      className={className}
    >
      <defs>
        <filter id={`glow-${id}`} x="-60%" y="-60%" width="220%" height="220%">
          <feGaussianBlur stdDeviation="3.5" result="blur1" />
          <feGaussianBlur stdDeviation="6" result="blur2" />
          <feMerge>
            <feMergeNode in="blur2" />
            <feMergeNode in="blur1" />
            <feMergeNode in="SourceGraphic" />
          </feMerge>
        </filter>
        {withGlow && (
          <radialGradient id={`bg-${id}`} cx="50%" cy="50%" r="50%">
            <stop offset="0%" stopColor="#00F2A6" stopOpacity="0.15" />
            <stop offset="100%" stopColor="#000000" stopOpacity="0" />
          </radialGradient>
        )}
      </defs>

      {/* Fondo glow opcional */}
      {withGlow && <circle cx="50" cy="50" r="50" fill={`url(#bg-${id})`} />}

      {/* Diamante rotado 45° con T interior — fiel al logo real */}
      <g filter={`url(#glow-${id})`} stroke="#00F2A6" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
        {/* Marco exterior del diamante (cuadrado rotado 45°) */}
        <polygon points="50,8 92,50 50,92 8,50" fill="none" />

        {/* Línea horizontal superior de la T (de borde izq a borde der, a 1/3 de altura) */}
        <line x1="8" y1="50" x2="92" y2="50" opacity="0" /> {/* helper invisible */}
        <line x1="29" y1="29" x2="71" y2="29" />

        {/* Barra vertical de la T (del centro de la línea horiz hasta el vértice inf) */}
        <line x1="50" y1="29" x2="50" y2="92" />

        {/* Líneas diagonales del girón (facetas internas del diamante) */}
        <line x1="29" y1="29" x2="8" y2="50" />
        <line x1="71" y1="29" x2="92" y2="50" />
      </g>
    </svg>
  );
}
