import React, { useState, useEffect, useRef } from 'react';

interface ComponentPickerProps {
  onSelect: (snippet: string) => void;
  onClose: () => void;
}

interface Template {
  name: string;
  displayName: string;
  category: 'code' | 'layout';
  snippet: string;
}

// Code Hike component templates with their MDX snippets
const CODE_TEMPLATES: Template[] = [
  {
    name: 'callout',
    displayName: 'Callout',
    category: 'code',
    snippet: `\`\`\`js
const lorem = ipsum(dolor, sit)
// !callout[/amet/] This is a callout
const [amet, consectetur] = [0, 0]
lorem.adipiscing((sed, elit) => {
  if (sed) {
    amet += elit
  }
})
\`\`\``
  },
  {
    name: 'classname',
    displayName: 'ClassName',
    category: 'code',
    snippet: `\`\`\`tsx
// !className[/important/] bg-yellow-200
function example() {
  // This is important
  return "highlighted";
}
\`\`\``
  },
  {
    name: 'code-mentions',
    displayName: 'Code Mentions',
    category: 'code',
    snippet: `The <CodeMention code="useState" /> hook is used for state management.`
  },
  {
    name: 'collapse',
    displayName: 'Collapse',
    category: 'code',
    snippet: `\`\`\`tsx
// !collapse[1:3]
import React from 'react'
import { useState } from 'react'
import { useEffect } from 'react'

function Component() {
  return <div>Hello</div>
}
\`\`\``
  },
  {
    name: 'copy-button',
    displayName: 'Copy Button',
    category: 'code',
    snippet: `\`\`\`tsx
// !copy
const greeting = "Hello, World!";
console.log(greeting);
\`\`\``
  },
  {
    name: 'diff',
    displayName: 'Diff',
    category: 'code',
    snippet: `\`\`\`tsx
function greet(name) {
-  console.log("Hello");
+  console.log("Hello, " + name);
}
\`\`\``
  },
  {
    name: 'file-name',
    displayName: 'File Name',
    category: 'code',
    snippet: `\`\`\`tsx title="example.tsx"
export function Example() {
  return <div>Hello</div>;
}
\`\`\``
  },
  {
    name: 'focus',
    displayName: 'Focus',
    category: 'code',
    snippet: `\`\`\`tsx
// !focus[1:3]
import React from 'react'

function Component() {
  // This line is focused
  return <div>Hello</div>
}
\`\`\``
  },
  {
    name: 'fold',
    displayName: 'Fold',
    category: 'code',
    snippet: `\`\`\`tsx
// !fold[1:3]
import React from 'react'
import { useState } from 'react'
import { useEffect } from 'react'

function Component() {
  return <div>Hello</div>
}
\`\`\``
  },
  {
    name: 'footnotes',
    displayName: 'Footnotes',
    category: 'code',
    snippet: `\`\`\`tsx
function example() {
  // !footnote[/useState/] React hook for state
  const [count, setCount] = useState(0);
  return count;
}
\`\`\``
  },
  {
    name: 'language-switcher',
    displayName: 'Language Switcher',
    category: 'code',
    snippet: `<LanguageSwitcher>

\`\`\`js
const greeting = "Hello";
\`\`\`

\`\`\`py
greeting = "Hello"
\`\`\`

\`\`\`rb
greeting = "Hello"
\`\`\`

</LanguageSwitcher>`
  },
  {
    name: 'line-numbers',
    displayName: 'Line Numbers',
    category: 'code',
    snippet: `\`\`\`tsx showLineNumbers
function example() {
  const x = 1;
  const y = 2;
  return x + y;
}
\`\`\``
  },
  {
    name: 'link',
    displayName: 'Link',
    category: 'code',
    snippet: `\`\`\`tsx
// !link[/useState/] https://react.dev/reference/react/useState
import { useState } from 'react';

function Counter() {
  const [count, setCount] = useState(0);
  return <button onClick={() => setCount(count + 1)}>{count}</button>;
}
\`\`\``
  },
  {
    name: 'mark',
    displayName: 'Mark',
    category: 'code',
    snippet: `\`\`\`tsx
// !mark[/important/]
function example() {
  // This is important
  return "marked";
}
\`\`\``
  },
  {
    name: 'tabs',
    displayName: 'Tabs',
    category: 'code',
    snippet: `<Tabs>

\`\`\`js title="JavaScript"
const greeting = "Hello";
\`\`\`

\`\`\`ts title="TypeScript"
const greeting: string = "Hello";
\`\`\`

</Tabs>`
  },
  {
    name: 'token-transitions',
    displayName: 'Token Transitions',
    category: 'code',
    snippet: `\`\`\`tsx
// Token transitions animate between code states
const before = "hello";
\`\`\`

\`\`\`tsx
// After the change
const after = "world";
\`\`\``
  },
  {
    name: 'tooltip',
    displayName: 'Tooltip',
    category: 'code',
    snippet: `\`\`\`tsx
// !tooltip[/useState/] A React hook for managing component state
import { useState } from 'react';

function Counter() {
  const [count, setCount] = useState(0);
  return count;
}
\`\`\``
  },
  {
    name: 'transpile',
    displayName: 'Transpile',
    category: 'code',
    snippet: `<Transpile>

\`\`\`jsx title="JSX"
function App() {
  return <h1>Hello</h1>;
}
\`\`\`

\`\`\`js title="JavaScript"
function App() {
  return React.createElement("h1", null, "Hello");
}
\`\`\`

</Transpile>`
  },
  {
    name: 'typescript',
    displayName: 'TypeScript',
    category: 'code',
    snippet: `\`\`\`tsx
// Hover over types to see TypeScript info
interface User {
  name: string;
  age: number;
}

function greet(user: User): string {
  return \`Hello, \${user.name}!\`;
}
\`\`\``
  },
  {
    name: 'word-wrap',
    displayName: 'Word Wrap',
    category: 'code',
    snippet: `\`\`\`tsx wordWrap
// This is a very long line that will wrap automatically when it exceeds the container width, demonstrating the word wrap feature
const longString = "This is another example of a very long string that needs to wrap";
\`\`\``
  }
];

const LAYOUT_TEMPLATES: Template[] = [
  {
    name: 'scrollycoding',
    displayName: 'Scrollycoding',
    category: 'layout',
    snippet: `<Scrollycoding>

## Step 1

First, we define our function.

\`\`\`tsx
function hello() {
  console.log("Hello");
}
\`\`\`

## Step 2

Then, we add a parameter.

\`\`\`tsx
function hello(name) {
  console.log("Hello, " + name);
}
\`\`\`

## Step 3

Finally, we return a value.

\`\`\`tsx
function hello(name) {
  return "Hello, " + name;
}
\`\`\`

</Scrollycoding>`
  },
  {
    name: 'slideshow',
    displayName: 'Slideshow',
    category: 'layout',
    snippet: `<Slideshow>

\`\`\`tsx title="Step 1"
const x = 1;
\`\`\`

\`\`\`tsx title="Step 2"
const x = 1;
const y = 2;
\`\`\`

\`\`\`tsx title="Step 3"
const x = 1;
const y = 2;
const z = x + y;
\`\`\`

</Slideshow>`
  },
  {
    name: 'spotlight',
    displayName: 'Spotlight',
    category: 'layout',
    snippet: `<Spotlight>

<SpotlightContent>

## Introduction

This is the spotlight layout. Click on different sections to highlight code.

</SpotlightContent>

<SpotlightCode>

\`\`\`tsx
function example() {
  // !spotlight[1] intro
  const greeting = "Hello";
  // !spotlight[2] main
  console.log(greeting);
  // !spotlight[3] end
  return greeting;
}
\`\`\`

</SpotlightCode>

</Spotlight>`
  }
];

const ALL_TEMPLATES = [...CODE_TEMPLATES, ...LAYOUT_TEMPLATES];

export function ComponentPicker({ onSelect, onClose }: ComponentPickerProps) {
  const [search, setSearch] = useState('');
  const [activeTab, setActiveTab] = useState<'code' | 'layouts'>('code');
  const modalRef = useRef<HTMLDivElement>(null);

  // Filter templates based on search and active tab
  const filteredTemplates = ALL_TEMPLATES.filter((t) => {
    const matchesSearch = t.displayName
      .toLowerCase()
      .includes(search.toLowerCase());
    const matchesTab =
      activeTab === 'code' ? t.category === 'code' : t.category === 'layout';
    return matchesSearch && matchesTab;
  });

  // Close on click outside
  useEffect(() => {
    const handleClickOutside = (e: MouseEvent) => {
      if (modalRef.current && !modalRef.current.contains(e.target as Node)) {
        onClose();
      }
    };

    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, [onClose]);

  // Close on escape
  useEffect(() => {
    const handleEscape = (e: KeyboardEvent) => {
      if (e.key === 'Escape') {
        onClose();
      }
    };

    document.addEventListener('keydown', handleEscape);
    return () => document.removeEventListener('keydown', handleEscape);
  }, [onClose]);

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center modal-backdrop">
      <div
        ref={modalRef}
        className="bg-ch-surface border border-ch-border rounded-lg shadow-2xl w-[600px] max-h-[80vh] flex flex-col"
      >
        {/* Header */}
        <div className="p-4 border-b border-ch-border">
          <div className="flex items-center justify-between mb-3">
            <h2 className="text-lg font-semibold">Insert Component</h2>
            <button
              onClick={onClose}
              className="text-ch-text-muted hover:text-ch-text p-1"
            >
              <svg
                className="w-5 h-5"
                viewBox="0 0 24 24"
                fill="none"
                stroke="currentColor"
                strokeWidth="2"
              >
                <path d="M18 6L6 18M6 6l12 12" />
              </svg>
            </button>
          </div>

          {/* Search */}
          <input
            type="text"
            placeholder="Search components..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="w-full px-3 py-2 bg-ch-bg border border-ch-border rounded-md text-ch-text placeholder:text-ch-text-muted focus:outline-none focus:border-ch-accent"
            autoFocus
          />

          {/* Tabs */}
          <div className="flex gap-2 mt-3">
            <button
              onClick={() => setActiveTab('code')}
              className={`px-3 py-1.5 rounded-md text-sm font-medium transition-colors ${
                activeTab === 'code'
                  ? 'bg-ch-accent text-ch-bg'
                  : 'text-ch-text-muted hover:text-ch-text hover:bg-ch-bg'
              }`}
            >
              Code ({CODE_TEMPLATES.length})
            </button>
            <button
              onClick={() => setActiveTab('layouts')}
              className={`px-3 py-1.5 rounded-md text-sm font-medium transition-colors ${
                activeTab === 'layouts'
                  ? 'bg-ch-accent text-ch-bg'
                  : 'text-ch-text-muted hover:text-ch-text hover:bg-ch-bg'
              }`}
            >
              Layouts ({LAYOUT_TEMPLATES.length})
            </button>
          </div>
        </div>

        {/* Component grid */}
        <div className="flex-1 overflow-auto p-4">
          {filteredTemplates.length === 0 ? (
            <div className="text-center text-ch-text-muted py-8">
              No components found
            </div>
          ) : (
            <div className="component-grid">
              {filteredTemplates.map((template) => (
                <button
                  key={template.name}
                  onClick={() => onSelect(template.snippet)}
                  className="p-3 bg-ch-bg border border-ch-border rounded-lg hover:border-ch-accent hover:bg-ch-accent/10 transition-colors text-left group"
                >
                  <div className="flex items-center gap-2">
                    <ComponentIcon category={template.category} />
                    <span className="text-sm font-medium group-hover:text-ch-accent">
                      {template.displayName}
                    </span>
                  </div>
                </button>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

function ComponentIcon({ category }: { category: 'code' | 'layout' }) {
  if (category === 'layout') {
    return (
      <svg
        className="w-4 h-4 text-ch-accent"
        viewBox="0 0 24 24"
        fill="none"
        stroke="currentColor"
        strokeWidth="2"
      >
        <rect x="3" y="3" width="7" height="7" />
        <rect x="14" y="3" width="7" height="7" />
        <rect x="3" y="14" width="7" height="7" />
        <rect x="14" y="14" width="7" height="7" />
      </svg>
    );
  }

  return (
    <svg
      className="w-4 h-4 text-ch-accent"
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="2"
    >
      <path d="M16 18l6-6-6-6" />
      <path d="M8 6l-6 6 6 6" />
    </svg>
  );
}
