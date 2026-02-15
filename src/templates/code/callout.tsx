/* MDX Snippet:
```js
const lorem = ipsum(dolor, sit)
// !callout[/amet/] This is a callout
const [amet, consectetur] = [0, 0]
lorem.adipiscing((sed, elit) => {
  if (sed) {
    amet += elit
  }
})
```
*/

import React from 'react';

interface CalloutProps {
  children: React.ReactNode;
  type?: 'info' | 'warning' | 'error' | 'success';
}

export function Callout({ children, type = 'info' }: CalloutProps) {
  const styles = {
    info: 'bg-blue-500/10 border-blue-500 text-blue-200',
    warning: 'bg-yellow-500/10 border-yellow-500 text-yellow-200',
    error: 'bg-red-500/10 border-red-500 text-red-200',
    success: 'bg-green-500/10 border-green-500 text-green-200'
  };

  const icons = {
    info: (
      <svg className="w-5 h-5" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
        <circle cx="12" cy="12" r="10" />
        <path d="M12 16v-4M12 8h.01" />
      </svg>
    ),
    warning: (
      <svg className="w-5 h-5" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
        <path d="M10.29 3.86L1.82 18a2 2 0 001.71 3h16.94a2 2 0 001.71-3L13.71 3.86a2 2 0 00-3.42 0z" />
        <path d="M12 9v4M12 17h.01" />
      </svg>
    ),
    error: (
      <svg className="w-5 h-5" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
        <circle cx="12" cy="12" r="10" />
        <path d="M15 9l-6 6M9 9l6 6" />
      </svg>
    ),
    success: (
      <svg className="w-5 h-5" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
        <circle cx="12" cy="12" r="10" />
        <path d="M9 12l2 2 4-4" />
      </svg>
    )
  };

  return (
    <div className={`flex gap-3 p-4 rounded-lg border-l-4 ${styles[type]}`}>
      <div className="flex-shrink-0">{icons[type]}</div>
      <div className="flex-1">{children}</div>
    </div>
  );
}
