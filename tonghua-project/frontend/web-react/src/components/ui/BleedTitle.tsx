import { type ReactNode } from 'react';

interface BleedTitleProps {
  children: ReactNode;
  className?: string;
  as?: 'h1' | 'h2' | 'h3';
}

export default function BleedTitle({
  children,
  className = '',
  as: Tag = 'h1',
}: BleedTitleProps) {
  return (
    <Tag
      className={`
        font-display font-black leading-[0.9] tracking-[-0.03em] text-ink
        ${Tag === 'h1' ? 'text-hero' : Tag === 'h2' ? 'text-h1' : 'text-h2'}
        ${className}
      `}
      style={{
        marginLeft: '-0.05em',
        marginRight: '-0.05em',
      }}
    >
      {children}
    </Tag>
  );
}
