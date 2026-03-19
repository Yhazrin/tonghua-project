import { type ReactNode } from 'react';

interface PaperTextureProps {
  children: ReactNode;
  variant?: 'paper' | 'aged' | 'warm';
  className?: string;
}

export default function PaperTexture({
  children,
  variant = 'paper',
  className = '',
}: PaperTextureProps) {
  const bgMap = {
    paper: 'bg-paper',
    aged: 'bg-aged-stock',
    warm: 'bg-warm-gray/30',
  };

  return (
    <div className={`relative ${bgMap[variant]} ${className}`}>
      <div
        className="absolute inset-0 pointer-events-none opacity-[0.04]"
        style={{
          backgroundImage: 'url(/textures/paper.png)',
          backgroundRepeat: 'repeat',
          backgroundSize: '400px 400px',
        }}
      />
      <div className="relative z-10">{children}</div>
    </div>
  );
}
