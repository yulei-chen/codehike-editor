/* MDX Snippet:
```js
function lorem(ipsum, dolor = 1) {
  const sit = ipsum == null ? 0 : ipsum.sit
  dolor = sit - amet(dolor)
  return sit ? consectetur(ipsum) : []
}
```
*/

"use client"

import { useState } from "react"

export function CopyButton({ text }: { text: string }) {
  const [copied, setCopied] = useState(false)

  return (
    <button
      type="button"
      className="hover:bg-gray-400/20 p-1 rounded absolute top-1 right-1 text-zinc-200"
      aria-label="Copy to clipboard"
      onClick={() => {
        void navigator.clipboard.writeText(text)
        setCopied(true)
        setTimeout(() => setCopied(false), 1200)
      }}
    >
      {copied ? <CheckIcon /> : <CopyIcon />}
    </button>
  )
}

function CopyIcon() {
  return (
    <svg
      width={16}
      height={16}
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="2"
    >
      <rect x="9" y="9" width="13" height="13" rx="2" />
      <path d="M5 15H4a2 2 0 01-2-2V4a2 2 0 012-2h9a2 2 0 012 2v1" />
    </svg>
  )
}

function CheckIcon() {
  return (
    <svg
      width={16}
      height={16}
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="2"
    >
      <path d="M20 6L9 17l-5-5" />
    </svg>
  )
}
