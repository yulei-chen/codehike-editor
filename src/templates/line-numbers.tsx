import { AnnotationHandler, InnerLine } from "codehike/code"

/**
 * Line numbers annotation handler for Code Hike
 * Usage: enable via code block meta or handler
 * Renders line numbers with width based on total line count.
 */
export const lineNumbers: AnnotationHandler = {
  name: "line-numbers",
  Line: (lineProps) => {
    const width = (lineProps.totalLines?.toString().length ?? 2) + 1
    return (
      <div className="flex leading-6">
        <span
          className="flex-shrink-0 text-right select-none text-slate-500 font-mono text-sm pr-2"
          style={{ minWidth: `${width}ch` }}
        >
          {lineProps.lineNumber}
        </span>
        <span className="flex-1">
          <InnerLine merge={lineProps} {...lineProps} />
        </span>
      </div>
    )
  },
}
