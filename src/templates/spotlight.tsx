import React, { useState, createContext, useContext } from 'react';

interface SpotlightContextValue {
  activeSpot: string | null;
  setActiveSpot: (spot: string | null) => void;
}

const SpotlightContext = createContext<SpotlightContextValue>({
  activeSpot: null,
  setActiveSpot: () => {}
});

interface SpotlightProps {
  children: React.ReactNode;
  defaultSpot?: string;
}

/**
 * Spotlight layout component
 * Shows content on the left with linked code highlights on the right
 */
export function Spotlight({ children, defaultSpot }: SpotlightProps) {
  const [activeSpot, setActiveSpot] = useState<string | null>(defaultSpot || null);

  return (
    <SpotlightContext.Provider value={{ activeSpot, setActiveSpot }}>
      <div className="flex rounded-lg border border-slate-700 overflow-hidden min-h-[400px]">
        {children}
      </div>
    </SpotlightContext.Provider>
  );
}

/**
 * SpotlightContent component for the prose content
 */
export function SpotlightContent({ children }: { children: React.ReactNode }) {
  return (
    <div className="w-1/2 p-6 bg-slate-900 overflow-y-auto">
      {children}
    </div>
  );
}

/**
 * SpotlightCode component for the code panel
 */
export function SpotlightCode({ children }: { children: React.ReactNode }) {
  return (
    <div className="w-1/2 bg-slate-800 border-l border-slate-700 p-4 overflow-auto">
      {children}
    </div>
  );
}

/**
 * SpotlightTrigger component to highlight specific code sections
 */
export function SpotlightTrigger({
  children,
  spot
}: {
  children: React.ReactNode;
  spot: string;
}) {
  const { activeSpot, setActiveSpot } = useContext(SpotlightContext);
  const isActive = activeSpot === spot;

  return (
    <span
      onMouseEnter={() => setActiveSpot(spot)}
      onMouseLeave={() => setActiveSpot(null)}
      onClick={() => setActiveSpot(isActive ? null : spot)}
      className={`
        cursor-pointer transition-colors
        ${isActive ? 'bg-blue-500/30 text-blue-200' : 'hover:bg-blue-500/10'}
      `}
    >
      {children}
    </span>
  );
}

/**
 * SpotlightRegion component for highlighted code regions
 */
export function SpotlightRegion({
  children,
  spot
}: {
  children: React.ReactNode;
  spot: string;
}) {
  const { activeSpot } = useContext(SpotlightContext);
  const isActive = activeSpot === spot;

  return (
    <span
      className={`
        transition-all duration-200
        ${isActive ? 'bg-blue-500/20 ring-1 ring-blue-500/50 rounded' : 'opacity-60'}
        ${activeSpot && !isActive ? 'opacity-30' : ''}
      `}
    >
      {children}
    </span>
  );
}

/**
 * Hook to use spotlight context
 */
export function useSpotlight() {
  return useContext(SpotlightContext);
}

/**
 * Handler for spotlight annotations in code blocks
 * Usage: // !spotlight[id] region-name
 */
export function handleSpotlightAnnotation(
  annotation: { data: string },
  children: React.ReactNode
) {
  return <SpotlightRegion spot={annotation.data}>{children}</SpotlightRegion>;
}
