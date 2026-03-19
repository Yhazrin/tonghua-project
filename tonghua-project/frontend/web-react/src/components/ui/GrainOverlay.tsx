interface GrainOverlayProps {
  opacity?: number;
  className?: string;
}

export default function GrainOverlay({ opacity = 0.06, className = '' }: GrainOverlayProps) {
  return (
    <div
      className={`absolute inset-0 pointer-events-none z-10 ${className}`}
      style={{
        backgroundImage: 'url(/textures/grain.png)',
        backgroundRepeat: 'repeat',
        backgroundSize: '200px 200px',
        opacity,
        mixBlendMode: 'multiply',
      }}
      aria-hidden="true"
    />
  );
}
