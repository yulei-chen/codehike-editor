/* MDX Snippet:
```tsx
// Token transitions animate between code states
const before = "hello";
```

```tsx
// After the change
const after = "world";
```
*/

import React, { useState, useEffect, useRef } from 'react';

interface TokenTransitionsProps {
  children: React.ReactNode[];
  autoPlay?: boolean;
  interval?: number;
}

/**
 * TokenTransitions component for animating between code states
 */
export function TokenTransitions({
  children,
  autoPlay = false,
  interval = 2000
}: TokenTransitionsProps) {
  const [activeIndex, setActiveIndex] = useState(0);
  const [isTransitioning, setIsTransitioning] = useState(false);
  const steps = React.Children.toArray(children);

  useEffect(() => {
    if (!autoPlay) return;

    const timer = setInterval(() => {
      setIsTransitioning(true);
      setTimeout(() => {
        setActiveIndex((prev) => (prev + 1) % steps.length);
        setIsTransitioning(false);
      }, 300);
    }, interval);

    return () => clearInterval(timer);
  }, [autoPlay, interval, steps.length]);

  const goTo = (index: number) => {
    if (index === activeIndex) return;
    setIsTransitioning(true);
    setTimeout(() => {
      setActiveIndex(index);
      setIsTransitioning(false);
    }, 300);
  };

  const goNext = () => {
    goTo((activeIndex + 1) % steps.length);
  };

  const goPrev = () => {
    goTo((activeIndex - 1 + steps.length) % steps.length);
  };

  return (
    <div className="rounded-lg overflow-hidden border border-slate-700">
      {/* Code content with transition */}
      <div
        className={`
          bg-slate-900 transition-opacity duration-300
          ${isTransitioning ? 'opacity-0' : 'opacity-100'}
        `}
      >
        {steps[activeIndex]}
      </div>

      {/* Navigation controls */}
      <div className="flex items-center justify-between px-4 py-2 bg-slate-800 border-t border-slate-700">
        <button
          onClick={goPrev}
          disabled={steps.length <= 1}
          className="p-1 text-slate-400 hover:text-white disabled:opacity-50 disabled:cursor-not-allowed"
        >
          <svg
            className="w-5 h-5"
            viewBox="0 0 24 24"
            fill="none"
            stroke="currentColor"
            strokeWidth="2"
          >
            <path d="M15 18l-6-6 6-6" />
          </svg>
        </button>

        {/* Step indicators */}
        <div className="flex gap-1">
          {steps.map((_, index) => (
            <button
              key={index}
              onClick={() => goTo(index)}
              className={`
                w-2 h-2 rounded-full transition-colors
                ${index === activeIndex ? 'bg-blue-500' : 'bg-slate-600 hover:bg-slate-500'}
              `}
            />
          ))}
        </div>

        <button
          onClick={goNext}
          disabled={steps.length <= 1}
          className="p-1 text-slate-400 hover:text-white disabled:opacity-50 disabled:cursor-not-allowed"
        >
          <svg
            className="w-5 h-5"
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
