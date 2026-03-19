interface DropCapProps {
  children: string;
  className?: string;
}

export default function DropCap({ children, className = '' }: DropCapProps) {
  if (!children || children.length === 0) return null;

  const firstLetter = children.charAt(0);
  const rest = children.slice(1);

  return (
    <p className={`font-body text-base text-ink-faded leading-relaxed ${className}`}>
      <span className="font-display text-[4.5em] float-left leading-[0.8] mr-3 mt-1 text-ink font-bold">
        {firstLetter}
      </span>
      {rest}
    </p>
  );
}
