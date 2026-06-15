export default function StarRating({ rating, className = '' }: { rating: number; className?: string }) {
  const rounded = Math.round(rating);
  return (
    <div className={`flex items-center gap-0.5 text-amber-400 ${className}`} aria-label={`Rating: ${rating} out of 5`}>
      {Array.from({ length: 5 }).map((_, i) => (
        <svg
          key={i}
          viewBox="0 0 20 20"
          fill={i < rounded ? 'currentColor' : 'none'}
          stroke="currentColor"
          strokeWidth={1.5}
          className="h-3.5 w-3.5"
        >
          <path
            strokeLinecap="round"
            strokeLinejoin="round"
            d="M10 1.5l2.6 5.27 5.82.85-4.21 4.1.99 5.78L10 14.9l-5.2 2.6.99-5.78-4.21-4.1 5.82-.85L10 1.5z"
          />
        </svg>
      ))}
    </div>
  );
}
