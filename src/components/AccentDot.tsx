type AccentDotProps = {
  className?: string;
};

// The pink full stop shared by the navbar logo and the hero heading.
export function AccentDot({ className = "" }: AccentDotProps) {
  return (
    <span
      aria-hidden="true"
      className={`inline-block shrink-0 rounded-full bg-accent ${className}`}
    />
  );
}
