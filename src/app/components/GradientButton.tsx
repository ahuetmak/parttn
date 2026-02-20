import React from 'react';

interface GradientButtonProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  children: React.ReactNode;
  variant?: 'primary' | 'secondary';
}

export function GradientButton({ children, variant = 'primary', className = '', ...props }: GradientButtonProps) {
  if (variant === 'secondary') {
    return (
      <button
        className={`px-6 py-3 rounded-xl border-2 border-[#00F2A6]/30 text-[#00F2A6] hover:bg-[#00F2A6]/10 transition-all duration-200 font-semibold ${className}`}
        {...props}
      >
        {children}
      </button>
    );
  }

  return (
    <button
      className={`px-6 py-3 rounded-xl bg-[#00F2A6] text-black hover:bg-[#00F2A6]/90 hover:shadow-[0_0_30px_rgba(0,242,166,0.4)] transition-all duration-200 font-bold ${className}`}
      {...props}
    >
      {children}
    </button>
  );
}