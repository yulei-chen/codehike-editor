import React, { useMemo } from 'react';

interface PreviewProps {
  content: string;
  filePath: string;
}

export function Preview({ content, filePath }: PreviewProps) {
  // Simple markdown preview - in production this would use MDX compilation
  const html = useMemo(() => {
    return parseMarkdownToHtml(content);
  }, [content]);

  return (
    <div className="h-full overflow-auto p-6 bg-ch-bg">
      <div className="max-w-3xl mx-auto">
        <div
          className="prose prose-invert prose-slate max-w-none"
          dangerouslySetInnerHTML={{ __html: html }}
        />
      </div>
    </div>
  );
}

/**
 * Simple markdown to HTML parser for preview
 * In production, this would use MDX compilation with Code Hike
 */
function parseMarkdownToHtml(markdown: string): string {
  let html = markdown;

  // Handle frontmatter (remove it)
  html = html.replace(/^---[\s\S]*?---\n?/, '');

  // Handle code blocks with language
  html = html.replace(
    /```(\w+)?\n([\s\S]*?)```/g,
    (_, lang, code) => {
      const escapedCode = escapeHtml(code.trim());
      return `<pre class="bg-ch-surface rounded-lg p-4 overflow-x-auto"><code class="language-${lang || 'text'} text-sm font-mono">${escapedCode}</code></pre>`;
    }
  );

  // Handle inline code
  html = html.replace(
    /`([^`]+)`/g,
    '<code class="bg-ch-surface px-1.5 py-0.5 rounded text-ch-accent font-mono text-sm">$1</code>'
  );

  // Handle headings
  html = html.replace(/^### (.+)$/gm, '<h3 class="text-xl font-semibold mt-6 mb-3">$1</h3>');
  html = html.replace(/^## (.+)$/gm, '<h2 class="text-2xl font-bold mt-8 mb-4">$1</h2>');
  html = html.replace(/^# (.+)$/gm, '<h1 class="text-3xl font-bold mt-8 mb-4">$1</h1>');

  // Handle bold and italic
  html = html.replace(/\*\*([^*]+)\*\*/g, '<strong>$1</strong>');
  html = html.replace(/\*([^*]+)\*/g, '<em>$1</em>');

  // Handle links
  html = html.replace(
    /\[([^\]]+)\]\(([^)]+)\)/g,
    '<a href="$2" class="text-ch-accent hover:underline">$1</a>'
  );

  // Handle unordered lists
  html = html.replace(/^- (.+)$/gm, '<li class="ml-4">$1</li>');
  html = html.replace(/(<li[^>]*>.*<\/li>\n?)+/g, '<ul class="list-disc my-4">$&</ul>');

  // Handle ordered lists
  html = html.replace(/^\d+\. (.+)$/gm, '<li class="ml-4">$1</li>');

  // Handle blockquotes
  html = html.replace(
    /^> (.+)$/gm,
    '<blockquote class="border-l-4 border-ch-accent pl-4 my-4 text-ch-text-muted italic">$1</blockquote>'
  );

  // Handle horizontal rules
  html = html.replace(/^---$/gm, '<hr class="my-8 border-ch-border" />');

  // Handle paragraphs (lines that aren't already wrapped)
  const lines = html.split('\n');
  const processedLines = lines.map((line) => {
    const trimmed = line.trim();
    if (
      trimmed === '' ||
      trimmed.startsWith('<') ||
      trimmed.startsWith('#') ||
      trimmed.startsWith('-') ||
      trimmed.startsWith('>') ||
      trimmed.match(/^\d+\./)
    ) {
      return line;
    }
    return `<p class="my-4">${line}</p>`;
  });

  html = processedLines.join('\n');

  // Handle JSX components (show placeholder)
  html = html.replace(
    /<([A-Z][a-zA-Z0-9]*)([^>]*)\/>/g,
    '<div class="bg-ch-surface border border-ch-border rounded-lg p-4 my-4"><span class="text-ch-accent font-mono">&lt;$1 /&gt;</span></div>'
  );

  html = html.replace(
    /<([A-Z][a-zA-Z0-9]*)([^>]*)>([\s\S]*?)<\/\1>/g,
    '<div class="bg-ch-surface border border-ch-border rounded-lg p-4 my-4"><span class="text-ch-accent font-mono">&lt;$1&gt;</span><div class="mt-2 pl-4 border-l-2 border-ch-border">$3</div><span class="text-ch-accent font-mono">&lt;/$1&gt;</span></div>'
  );

  return html;
}

function escapeHtml(text: string): string {
  return text
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
    .replace(/'/g, '&#039;');
}
