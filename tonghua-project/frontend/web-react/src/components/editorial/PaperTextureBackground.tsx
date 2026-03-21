import { type ReactNode, type CSSProperties } from 'react';

interface PaperTextureBackgroundProps {
  children: ReactNode;
  variant?: 'paper' | 'aged' | 'dark';
  className?: string;
}

const TEXTURE_STYLE: CSSProperties = {
  backgroundImage: 'var(--grain-overlay)',
  backgroundSize: '150px 150px',
};

export default function PaperTextureBackground({
  children,
  variant = 'paper',
  className = '',
}: PaperTextureBackgroundProps) {
  const bgClasses = {
    paper: 'bg-paper',
    aged: 'bg-aged-stock',
    dark: 'bg-ink text-paper',
  };

  return (
    <div className={`relative ${bgClasses[variant]} ${className}`}>
      {/* Subtle texture overlay */}
      <div
        className="absolute inset-0 pointer-events-none opacity-[0.06]"
        aria-hidden="true"
        style={TEXTURE_STYLE}
      />

      {/* Content */}
      <div className="relative z-[1]">{children}</div>
    </div>
  );
}
