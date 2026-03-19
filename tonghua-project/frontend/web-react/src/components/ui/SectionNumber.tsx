interface SectionNumberProps {
  number: number;
  title: string;
  className?: string;
}

export default function SectionNumber({ number, title, className = '' }: SectionNumberProps) {
  return (
    <div className={`flex items-baseline gap-3 ${className}`}>
      <span className="font-body text-caption text-sepia-mid tracking-[0.2em]">
        {String(number).padStart(2, '0')}
      </span>
      <span className="font-body text-label text-sepia-mid tracking-[0.15em] uppercase">
        {title}
      </span>
      <span className="flex-1 h-px bg-warm-gray/40 ml-2 self-center" />
    </div>
  );
}
