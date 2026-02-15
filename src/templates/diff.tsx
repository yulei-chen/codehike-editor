import {
  AnnotationHandler,
  InnerLine,
  BlockAnnotation,
} from "codehike/code"

/**
 * Diff annotation handler for Code Hike
 * Usage: lines starting with + or - in code block
 * Transform adds "mark" annotation for border/color; Line prepends +/- icon.
 */
export const diff: AnnotationHandler = {
  name: "diff",
  onlyIfAnnotated: true,
  transform: (annotation: BlockAnnotation) => {
    const color = annotation.query === "-" ? "#f85149" : "#3fb950"
    return [
      annotation,
      { ...annotation, name: "mark", query: color } as BlockAnnotation,
    ]
  },
  Line: (lineProps) => {
    const { annotation, ...rest } = lineProps
    return (
      <div className="flex leading-6">
        {annotation?.query != null && (
          <span className="flex-shrink-0 w-4 select-none text-slate-500 font-mono text-sm">
            {annotation.query}
          </span>
        )}
        <span className="flex-1">
          <InnerLine merge={lineProps} {...rest} />
        </span>
      </div>
    )
  },
}
