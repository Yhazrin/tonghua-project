export default function GrainOverlay() {
  return (
    <div
      className="fixed inset-0 pointer-events-none z-[999]"
      style={{
        opacity: 0.3,
        backgroundImage: 'var(--grain-overlay)',
        backgroundRepeat: 'repeat',
        backgroundSize: '256px 256px',
        mixBlendMode: 'multiply',
      }}
      aria-hidden="true"
    />
  );
}
