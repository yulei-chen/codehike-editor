import React, { useState, useEffect, useRef } from 'react';

interface Step {
  content: React.ReactNode;
  code: React.ReactNode;
}

interface ScrollycodingProps {
  children: React.ReactNode;
  steps?: Step[];
}

/**
 * Scrollycoding layout component
 * Shows content on the left that scrolls, with code on the right that updates
 */
export function Scrollycoding({ children, steps = [] }: ScrollycodingProps) {
  const [activeStep, setActiveStep] = useState(0);
  const containerRef = useRef<HTMLDivElement>(null);
  const stepRefs = useRef<(HTMLDivElement | null)[]>([]);

  // Extract steps from children if not provided
  const extractedSteps = steps.length > 0 ? steps : extractStepsFromChildren(children);

  useEffect(() => {
    const observer = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          if (entry.isIntersecting) {
            const index = stepRefs.current.indexOf(entry.target as HTMLDivElement);
            if (index !== -1) {
              setActiveStep(index);
            }
          }
        });
      },
      {
        root: containerRef.current,
        rootMargin: '-40% 0px -40% 0px',
        threshold: 0
      }
    );

    stepRefs.current.forEach((ref) => {
      if (ref) observer.observe(ref);
    });

    return () => observer.disconnect();
  }, [extractedSteps.length]);

  return (
    <div ref={containerRef} className="flex h-[600px] rounded-lg border border-slate-700 overflow-hidden">
      {/* Scrollable content on the left */}
      <div className="w-1/2 overflow-y-auto p-6 bg-slate-900">
        {extractedSteps.map((step, index) => (
          <div
            key={index}
            ref={(el) => (stepRefs.current[index] = el)}
            className={`
              min-h-[60%] py-8 transition-opacity duration-300
              ${index === activeStep ? 'opacity-100' : 'opacity-40'}
            `}
          >
            {step.content}
          </div>
        ))}
      </div>

      {/* Sticky code on the right */}
      <div className="w-1/2 bg-slate-800 border-l border-slate-700 p-4 sticky top-0">
        <div className="h-full flex items-center justify-center">
          <div className="w-full">
            {extractedSteps[activeStep]?.code}
          </div>
        </div>
      </div>
    </div>
  );
}

/**
 * ScrollycodingStep component for individual steps
 */
export function ScrollycodingStep({
  children,
  code
}: {
  children: React.ReactNode;
  code: React.ReactNode;
}) {
  return (
    <div data-scrollycoding-step>
      <div data-step-content>{children}</div>
      <div data-step-code>{code}</div>
    </div>
  );
}

/**
 * Extract steps from MDX children
 */
function extractStepsFromChildren(children: React.ReactNode): Step[] {
  const steps: Step[] = [];
  const childArray = React.Children.toArray(children);

  let currentContent: React.ReactNode[] = [];
  let currentCode: React.ReactNode = null;

  childArray.forEach((child) => {
    if (React.isValidElement(child)) {
      // Check if it's a code block
      if (
        child.type === 'pre' ||
        (typeof child.type === 'string' && child.type === 'pre')
      ) {
        currentCode = child;
        steps.push({
          content: <>{currentContent}</>,
          code: currentCode
        });
        currentContent = [];
        currentCode = null;
      } else {
        currentContent.push(child);
      }
    } else {
      currentContent.push(child);
    }
  });

  // Handle any remaining content
  if (currentContent.length > 0 && steps.length > 0) {
    // Append to last step if no new code
  }

  return steps;
}
