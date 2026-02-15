/* MDX Snippet:
<Slideshow>

```tsx title="Step 1"
const x = 1;
```

```tsx title="Step 2"
const x = 1;
const y = 2;
```

```tsx title="Step 3"
const x = 1;
const y = 2;
const z = x + y;
```

</Slideshow>
*/

import React, { useState, useCallback } from 'react';

interface Slide {
  title?: string;
  content: React.ReactNode;
}

interface SlideshowProps {
  children: React.ReactNode;
  slides?: Slide[];
  autoPlay?: boolean;
  interval?: number;
}

/**
 * Slideshow layout component
 * Shows code slides with navigation controls
 */
export function Slideshow({
  children,
  slides = [],
  autoPlay = false,
  interval = 3000
}: SlideshowProps) {
  const [currentSlide, setCurrentSlide] = useState(0);

  // Extract slides from children if not provided
  const extractedSlides: Slide[] =
    slides.length > 0
      ? slides
      : React.Children.toArray(children)
          .filter((child): child is React.ReactElement => React.isValidElement(child))
          .map((child) => ({
            title: child.props?.title,
            content: child
          }));

  const totalSlides = extractedSlides.length;

  const goToSlide = useCallback((index: number) => {
    setCurrentSlide(index);
  }, []);

  const goNext = useCallback(() => {
    setCurrentSlide((prev) => (prev + 1) % totalSlides);
  }, [totalSlides]);

  const goPrev = useCallback(() => {
    setCurrentSlide((prev) => (prev - 1 + totalSlides) % totalSlides);
  }, [totalSlides]);

  // Auto-play effect
  React.useEffect(() => {
    if (!autoPlay) return;

    const timer = setInterval(goNext, interval);
    return () => clearInterval(timer);
  }, [autoPlay, interval, goNext]);

  if (totalSlides === 0) {
    return <>{children}</>;
  }

  return (
    <div className="rounded-lg overflow-hidden border border-slate-700">
      {/* Slide header with title */}
      <div className="flex items-center justify-between px-4 py-2 bg-slate-800 border-b border-slate-700">
        <span className="text-sm text-slate-300 font-medium">
          {extractedSlides[currentSlide]?.title || `Slide ${currentSlide + 1}`}
        </span>
        <span className="text-sm text-slate-500">
          {currentSlide + 1} / {totalSlides}
        </span>
      </div>

      {/* Slide content */}
      <div className="bg-slate-900 min-h-[200px]">
        {extractedSlides[currentSlide]?.content}
      </div>

      {/* Navigation controls */}
      <div className="flex items-center justify-between px-4 py-3 bg-slate-800 border-t border-slate-700">
        <button
          onClick={goPrev}
          disabled={totalSlides <= 1}
          className="flex items-center gap-1 px-3 py-1.5 text-sm text-slate-300 hover:text-white hover:bg-slate-700 rounded transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
        >
          <svg
            className="w-4 h-4"
            viewBox="0 0 24 24"
            fill="none"
            stroke="currentColor"
            strokeWidth="2"
          >
            <path d="M15 18l-6-6 6-6" />
          </svg>
          Previous
        </button>

        {/* Slide indicators */}
        <div className="flex gap-1.5">
          {extractedSlides.map((_, index) => (
            <button
              key={index}
              onClick={() => goToSlide(index)}
              className={`
                w-2 h-2 rounded-full transition-colors
                ${index === currentSlide ? 'bg-blue-500' : 'bg-slate-600 hover:bg-slate-500'}
              `}
              aria-label={`Go to slide ${index + 1}`}
            />
          ))}
        </div>

        <button
          onClick={goNext}
          disabled={totalSlides <= 1}
          className="flex items-center gap-1 px-3 py-1.5 text-sm text-slate-300 hover:text-white hover:bg-slate-700 rounded transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
        >
          Next
          <svg
            className="w-4 h-4"
            viewBox="0 0 24 24"
            fill="none"
            stroke="currentColor"
            strokeWidth="2"
          >
            <path d="M9 18l6-6-6-6" />
          </svg>
        </button>
      </div>
    </div>
  );
}

/**
 * Slide component for individual slides
 */
export function Slide({
  children,
  title
}: {
  children: React.ReactNode;
  title?: string;
}) {
  return <div data-slide-title={title}>{children}</div>;
}
