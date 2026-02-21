/* MDX Snippet:
```js
// !fold[/className="(.*?)"/gm]

function Foo() {
  return (
    <div className="bg-red-200 opacity-50">
      <span className="block">hey</span>
    </div>
  )
}
```
*/

"use client"

import { AnnotationHandler } from "codehike/code"
import { useState } from "react"

export const InlineFold: AnnotationHandler["Inline"] = ({ children }) => {
  const [folded, setFolded] = useState(true)
  if (!folded) {
    return <>{children}</>
  }
  return (
    <button
      type="button"
      onClick={() => setFolded(false)}
      aria-label="Expand"
      className="inline-flex items-center gap-0.5 px-1 py-0 rounded bg-slate-700/50 text-slate-400 text-xs cursor-pointer hover:bg-slate-700 hover:text-slate-300"
    >
      ...
    </button>
  )
}

// fold AnnotationHandler is defined in code.tsx (imports InlineFold from here)
