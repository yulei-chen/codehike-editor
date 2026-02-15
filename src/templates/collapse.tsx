"use client"

import React, { useState } from "react"
import {
  AnnotationHandler,
  BlockAnnotation,
  InnerLine,
} from "codehike/code"

/**
 * Simple collapsible wrapper (no shadcn). Content is hidden when collapsed.
 */
function Collapsible({
  children,
  trigger,
  defaultOpen = false,
}: {
  children: React.ReactNode
  trigger: React.ReactNode
  defaultOpen?: boolean
}) {
  const [open, setOpen] = useState(defaultOpen)
  return (
    <div className="relative">
      <div className="flex items-center gap-1">
        <button
          type="button"
          onClick={() => setOpen(!open)}
          className="flex-shrink-0 p-0.5 text-slate-400 hover:text-slate-200 rounded"
          aria-expanded={open}
        >
          <ChevronIcon className={`w-4 h-4 transition-transform ${open ? "rotate-180" : ""}`} />
        </button>
        {trigger}
      </div>
      {open ? <div className="pl-5">{children}</div> : null}
    </div>
  )
}

function ChevronIcon({ className }: { className?: string }) {
  return (
    <svg
      className={className}
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="2"
    >
      <path d="M6 9l6 6 6-6" />
    </svg>
  )
}

/**
 * Collapse annotation: fold/unfold blocks of code.
 * Usage: // !collapse[fromLine:toLine] - first line is trigger, rest is content.
 * Pass collapse, collapseTrigger, and collapseContent to Pre handlers.
 */
export const collapse: AnnotationHandler = {
  name: "collapse",
  transform: (annotation: BlockAnnotation) => {
    const { fromLineNumber } = annotation
    return [
      annotation,
      {
        ...annotation,
        fromLineNumber,
        toLineNumber: fromLineNumber,
        name: "CollapseTrigger",
      } as BlockAnnotation,
      {
        ...annotation,
        fromLineNumber: fromLineNumber + 1,
        name: "CollapseContent",
      } as BlockAnnotation,
    ]
  },
  Block: ({ children }) => {
    const arr = React.Children.toArray(children)
    const trigger = arr[0]
    const content = arr.slice(1)
    return (
      <Collapsible defaultOpen={false} trigger={trigger}>
        {content}
      </Collapsible>
    )
  },
}

export const collapseTrigger: AnnotationHandler = {
  name: "CollapseTrigger",
  onlyIfAnnotated: true,
  AnnotatedLine: (lineProps) => (
    <div className="flex items-center gap-1">
      <ChevronIcon className="w-4 h-4 flex-shrink-0 text-slate-400" />
      <InnerLine merge={lineProps} {...lineProps} />
    </div>
  ),
  Line: (lineProps) => (
    <div className="flex items-center">
      <InnerLine merge={lineProps} {...lineProps} />
    </div>
  ),
}

export const collapseContent: AnnotationHandler = {
  name: "CollapseContent",
  Block: ({ children }) => <div>{children}</div>,
}
