/* MDX Snippet:
```tsx
// Hover over types to see TypeScript info
interface User {
  name: string;
  age: number;
}

function greet(user: User): string {
  return `Hello, ${user.name}!`;
}
```
*/

import React, { useState } from 'react';

interface TypeInfoProps {
  children: React.ReactNode;
  type: string;
  documentation?: string;
}

/**
 * TypeInfo component for TypeScript hover information
 */
export function TypeInfo({
  children,
  type,
  documentation
}: TypeInfoProps) {
  const [show, setShow] = useState(false);

  return (
    <span
      className="relative inline-block"
      onMouseEnter={() => setShow(true)}
      onMouseLeave={() => setShow(false)}
    >
      <span className="cursor-help">{children}</span>

      {show && (
        <span className="absolute z-50 bottom-full left-0 mb-2 p-2 bg-slate-800 border border-slate-600 rounded-lg shadow-xl max-w-md">
          <div className="font-mono text-sm text-blue-300">{type}</div>
          {documentation && (
            <div className="mt-1 text-sm text-slate-300">{documentation}</div>
          )}
        </span>
      )}
    </span>
  );
}

/**
 * TypeHighlight component for type annotations
 */
export function TypeHighlight({
  children,
  isType = false
}: {
  children: React.ReactNode;
  isType?: boolean;
}) {
  return (
    <span className={isType ? 'text-cyan-300' : ''}>
      {children}
    </span>
  );
}

/**
 * TypeScriptCode wrapper with type hover support
 */
export function TypeScriptCode({
  children,
  typeInfo
}: {
  children: React.ReactNode;
  typeInfo?: Record<string, { type: string; doc?: string }>;
}) {
  return (
    <div className="typescript-code relative">
      {children}
      {/* Type info tooltips would be injected here */}
    </div>
  );
}

/**
 * Interface highlight component
 */
export function InterfaceDefinition({
  name,
  children
}: {
  name: string;
  children: React.ReactNode;
}) {
  return (
    <div className="interface-definition">
      <span className="text-purple-400">interface</span>{' '}
      <span className="text-cyan-300">{name}</span>
      {' {'}
      <div className="pl-4">{children}</div>
      {'}'}
    </div>
  );
}

/**
 * Property definition in an interface
 */
export function PropertyDefinition({
  name,
  type,
  optional = false
}: {
  name: string;
  type: string;
  optional?: boolean;
}) {
  return (
    <div>
      <span className="text-slate-200">{name}</span>
      {optional && <span className="text-slate-500">?</span>}
      <span className="text-slate-500">: </span>
      <span className="text-cyan-300">{type}</span>
      <span className="text-slate-500">;</span>
    </div>
  );
}
