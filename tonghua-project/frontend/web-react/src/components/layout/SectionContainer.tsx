import { type ReactNode } from 'react';

interface SectionContainerProps {
  children: ReactNode;
  className?: string;
  noPadding?: boolean;
  narrow?: boolean;
}

export default function SectionContainer({
  children,
  className = '',
  noPadding = false,
  narrow = false,
}: SectionContainerProps) {
  return (
    <section
      className={`
        ${noPadding ? '' : 'section-spacing'}
        ${className}
      `}
    >
      <div
        className={`
          mx-auto px-6 md:px-10
          ${narrow ? 'max-w-3xl' : 'max-w-[1400px]'}
        `}
      >
        {children}
      </div>
    </section>
  );
}
