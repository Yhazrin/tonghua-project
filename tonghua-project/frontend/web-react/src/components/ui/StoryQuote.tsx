interface StoryQuoteProps {
  quote: string;
  attribution?: string;
  className?: string;
}

export default function StoryQuote({ quote, attribution, className = '' }: StoryQuoteProps) {
  return (
    <blockquote className={`relative py-8 ${className}`}>
      <span
        className="absolute top-0 left-0 font-display text-[120px] leading-none text-rust/15 select-none pointer-events-none"
        aria-hidden="true"
      >
        &ldquo;
      </span>
      <p className="font-display text-h3 md:text-h2 italic text-ink leading-snug pl-8 pr-4">
        {quote}
      </p>
      {attribution && (
        <footer className="mt-4 pl-8">
          <cite className="font-body text-label text-sepia-mid not-italic tracking-wider uppercase">
            &mdash; {attribution}
          </cite>
        </footer>
      )}
    </blockquote>
  );
}
