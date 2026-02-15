/* MDX Snippet:
<Tabs>

```js title="JavaScript"
const greeting = "Hello";
```

```ts title="TypeScript"
const greeting: string = "Hello";
```

</Tabs>
*/

import React, { useState } from 'react';

interface Tab {
  title: string;
  content: React.ReactNode;
}

interface TabsProps {
  children: React.ReactNode;
  tabs?: Tab[];
  defaultTab?: number;
}

/**
 * Tabs component for tabbed code blocks
 */
export function Tabs({ children, tabs = [], defaultTab = 0 }: TabsProps) {
  const [activeTab, setActiveTab] = useState(defaultTab);

  // Extract tabs from children if not provided directly
  const extractedTabs: Tab[] =
    tabs.length > 0
      ? tabs
      : React.Children.toArray(children)
          .filter((child): child is React.ReactElement => React.isValidElement(child))
          .map((child, index) => ({
            title: child.props?.title || `Tab ${index + 1}`,
            content: child
          }));

  if (extractedTabs.length === 0) {
    return <>{children}</>;
  }

  return (
    <div className="rounded-lg overflow-hidden border border-slate-700">
      {/* Tab headers */}
      <div className="flex bg-slate-800 border-b border-slate-700">
        {extractedTabs.map((tab, index) => (
          <button
            key={index}
            onClick={() => setActiveTab(index)}
            className={`
              px-4 py-2 text-sm font-medium transition-colors
              ${
                index === activeTab
                  ? 'bg-slate-900 text-white border-b-2 border-blue-500 -mb-px'
                  : 'text-slate-400 hover:text-slate-200 hover:bg-slate-700/50'
              }
            `}
          >
            {tab.title}
          </button>
        ))}
      </div>

      {/* Tab content */}
      <div className="bg-slate-900">{extractedTabs[activeTab]?.content}</div>
    </div>
  );
}

/**
 * TabPanel component for individual tab content
 */
export function TabPanel({
  children,
  title
}: {
  children: React.ReactNode;
  title: string;
}) {
  return <div data-title={title}>{children}</div>;
}
