import { AnnotationHandler, InnerLine } from "codehike/code"

const defaultColor = "rgb(14 165 233)"

/**
 * Mark annotation handler for Code Hike
 * Usage: // !mark[/pattern/] or // !mark[/pattern/] color (e.g. #hex or rgb())
 * annotation.query is used as optional color for the mark.
 */
export const mark: AnnotationHandler = {
  name: "mark",
  Line: (lineProps) => {
    const { annotation, ...rest } = lineProps
    const color = annotation?.query || defaultColor
    return (
      <div
        style={{ backgroundColor: `${color}20`, borderLeft: `2px solid ${color}` }}
        className="pl-2"
      >
        <InnerLine merge={lineProps} {...rest} />
      </div>
    )
  },
  Inline: ({ annotation, children }) => {
    const color = annotation?.query || defaultColor
    return (
      <span
        style={{ backgroundColor: `${color}40` }}
        className="rounded px-0.5"
      >
        {children}
      </span>
    )
  },
}
