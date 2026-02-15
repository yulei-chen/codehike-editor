"use client"

import { useState, useRef, useEffect } from "react"
import { AnnotationHandler } from "codehike/code"

/**
 * Tooltip annotation handler for Code Hike.
 * Usage: // !tooltip[/pattern/] or match tooltip content from block data (data.children).
 * data?.children can be MDX content when using CodeWithTooltips pattern.
 */
export const tooltip: AnnotationHandler = {
  name: "tooltip",
  Inline: ({ annotation, children }) => {
    const content = (annotation.data as { children?: React.ReactNode })?.children ?? annotation.query ?? ""
    return (
      <InlineTooltip content={content}>{children}</InlineTooltip>
    )
  },
}

function InlineTooltip({
  content,
  children,
}: {
  content: React.ReactNode
  children: React.ReactNode
}) {
  const [show, setShow] = useState(false)
  const [coords, setCoords] = useState({ x: 0, y: 0 })
  const triggerRef = useRef<HTMLSpanElement>(null)

  useEffect(() => {
    if (show && triggerRef.current) {
      const rect = triggerRef.current.getBoundingClientRect()
      setCoords({
        x: rect.left + rect.width / 2,
        y: rect.top,
      })
    }
  }, [show])

  return (
    <span
      ref={triggerRef}
      className="relative inline-block"
      onMouseEnter={() => setShow(true)}
      onMouseLeave={() => setShow(false)}
    >
      <span className="border-b border-dashed border-blue-400 cursor-help">
        {children}
      </span>
      {show && (
        <span
          className="absolute z-50 px-2 py-1 text-sm bg-slate-700 text-slate-200 rounded shadow-lg whitespace-normal max-w-xs bottom-full left-1/2 -translate-x-1/2 mb-2"
          style={{ pointerEvents: "none" }}
        >
          {content}
          <span className="absolute w-2 h-2 bg-slate-700 rotate-45 bottom-0 left-1/2 -translate-x-1/2 translate-y-1/2" />
        </span>
      )}
    </span>
  )
}
