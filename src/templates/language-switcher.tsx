/* MDX Snippet:
<LanguageSwitcher>

```js
const greeting = "Hello";
```

```py
greeting = "Hello"
```

```rb
greeting = "Hello"
```

</LanguageSwitcher>
*/

import React, { useState } from 'react';

interface CodeVariant {
  language: string;
  code: React.ReactNode;
}

interface LanguageSwitcherProps {
  children: React.ReactNode;
  variants?: CodeVariant[];
  defaultLanguage?: string;
}

/**
 * LanguageSwitcher component for showing code in multiple languages
 */
export function LanguageSwitcher({
  children,
  variants = [],
  defaultLanguage
}: LanguageSwitcherProps) {
  const [activeLanguage, setActiveLanguage] = useState(
    defaultLanguage || (variants[0]?.language ?? 'js')
  );

  // If using children directly (from MDX)
  if (React.Children.count(children) > 0 && variants.length === 0) {
    const childArray = React.Children.toArray(children);
    const extractedVariants: CodeVariant[] = childArray
      .filter((child): child is React.ReactElement => React.isValidElement(child))
      .map((child) => ({
        language: child.props?.className?.replace('language-', '') || 'text',
        code: child
      }));

    return (
      <LanguageSwitcherInner
        variants={extractedVariants}
        activeLanguage={activeLanguage}
        onLanguageChange={setActiveLanguage}
      />
    );
  }

  return (
    <LanguageSwitcherInner
      variants={variants}
      activeLanguage={activeLanguage}
      onLanguageChange={setActiveLanguage}
    />
  );
}

function LanguageSwitcherInner({
  variants,
  activeLanguage,
  onLanguageChange
}: {
  variants: CodeVariant[];
  activeLanguage: string;
  onLanguageChange: (lang: string) => void;
}) {
  const languages = variants.map((v) => v.language);
  const activeVariant = variants.find((v) => v.language === activeLanguage) || variants[0];

  const languageLabels: Record<string, string> = {
    js: 'JavaScript',
    ts: 'TypeScript',
    tsx: 'TypeScript',
    jsx: 'JavaScript',
    py: 'Python',
    rb: 'Ruby',
    go: 'Go',
    rs: 'Rust',
    java: 'Java',
    cpp: 'C++',
    c: 'C',
    cs: 'C#',
    php: 'PHP',
    swift: 'Swift',
    kotlin: 'Kotlin'
  };

  return (
    <div className="rounded-lg overflow-hidden border border-slate-700">
      {/* Language tabs */}
      <div className="flex bg-slate-800 border-b border-slate-700">
        {languages.map((lang) => (
          <button
            key={lang}
            onClick={() => onLanguageChange(lang)}
            className={`
              px-4 py-2 text-sm font-medium transition-colors
              ${
                lang === activeLanguage
                  ? 'bg-slate-700 text-white'
                  : 'text-slate-400 hover:text-slate-200 hover:bg-slate-700/50'
              }
            `}
          >
            {languageLabels[lang] || lang.toUpperCase()}
          </button>
        ))}
      </div>

      {/* Code content */}
      <div className="bg-slate-900">{activeVariant?.code}</div>
    </div>
  );
}
