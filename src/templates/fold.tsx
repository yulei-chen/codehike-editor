"use client"

import { AnnotationHandler } from "codehike/code"
import { useState } from "react"

/**
 * Inline fold: when folded shows "..." button; when expanded shows children.
 * Usage: // !fold[/pattern/] to fold inline content (e.g. long classNames).
 */
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

export const fold: AnnotationHandler = {
  name: "fold",
  Inline: InlineFold,
}
