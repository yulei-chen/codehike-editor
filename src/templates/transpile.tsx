/* MDX Snippet:
<Transpile>

```jsx title="JSX"
function App() {
  return <h1>Hello</h1>;
}
```

```js title="JavaScript"
function App() {
  return React.createElement("h1", null, "Hello");
}
```

</Transpile>
*/

import React, { useState } from 'react';

interface TranspileProps {
  children: React.ReactNode;
  defaultView?: 'source' | 'compiled';
}

/**
 * Transpile component for showing source vs compiled code
 */
export function Transpile({
  children,
  defaultView = 'source'
}: TranspileProps) {
  const [view, setView] = useState(defaultView);

  const childArray = React.Children.toArray(children).filter(
    (child): child is React.ReactElement => React.isValidElement(child)
  );

  const sourceCode = childArray[0];
  const compiledCode = childArray[1];

  const sourceTitle = sourceCode?.props?.title || 'Source';
  const compiledTitle = compiledCode?.props?.title || 'Compiled';

  return (
    <div className="rounded-lg overflow-hidden border border-slate-700">
      {/* Toggle header */}
      <div className="flex bg-slate-800 border-b border-slate-700">
        <button
          onClick={() => setView('source')}
          className={`
            flex-1 px-4 py-2 text-sm font-medium transition-colors
            ${
              view === 'source'
                ? 'bg-slate-900 text-white'
                : 'text-slate-400 hover:text-slate-200 hover:bg-slate-700/50'
            }
          `}
        >
          {sourceTitle}
        </button>
        <div className="w-px bg-slate-700" />
        <button
          onClick={() => setView('compiled')}
          className={`
            flex-1 px-4 py-2 text-sm font-medium transition-colors
            ${
              view === 'compiled'
                ? 'bg-slate-900 text-white'
                : 'text-slate-400 hover:text-slate-200 hover:bg-slate-700/50'
            }
          `}
        >
          {compiledTitle}
        </button>
      </div>

      {/* Arrow indicator */}
      <div className="flex items-center justify-center py-1 bg-slate-800 text-slate-500">
        <svg
          className="w-4 h-4"
          viewBox="0 0 24 24"
          fill="none"
          stroke="currentColor"
          strokeWidth="2"
        >
          <path d="M5 12h14M12 5l7 7-7 7" />
        </svg>
      </div>

      {/* Code content */}
      <div className="bg-slate-900">
        {view === 'source' ? sourceCode : compiledCode}
      </div>
    </div>
  );
}

/**
 * TranspileSource component for the source code
 */
export function TranspileSource({
  children,
  title = 'Source'
}: {
  children: React.ReactNode;
  title?: string;
}) {
  return <div data-transpile-role="source" data-title={title}>{children}</div>;
}

/**
 * TranspileCompiled component for the compiled code
 */
export function TranspileCompiled({
  children,
  title = 'Compiled'
}: {
  children: React.ReactNode;
  title?: string;
}) {
  return <div data-transpile-role="compiled" data-title={title}>{children}</div>;
}
