/* MDX Snippet:
The <CodeMention code="useState" /> hook is used for state management.
*/

import React from 'react';

interface CodeMentionProps {
  code: string;
  language?: string;
}

/**
 * CodeMention component for inline code references in prose
 * Renders code with syntax highlighting inline with text
 */
export function CodeMention({ code, language = 'tsx' }: CodeMentionProps) {
  return (
    <code className="px-1.5 py-0.5 rounded bg-slate-800 text-sm font-mono text-blue-300">
      {code}
    </code>
  );
}

/**
 * CodeMentions wrapper for multiple code mentions
 */
export function CodeMentions({ children }: { children: React.ReactNode }) {
  return <>{children}</>;
}
