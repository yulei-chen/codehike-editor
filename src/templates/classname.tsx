import { AnnotationHandler } from "codehike/code"

/**
 * ClassName annotation handler for Code Hike
 * Usage: // !className[/pattern/] classNames
 * Applies custom CSS classes to matched code (annotation.data or query as class names)
 */
export const className: AnnotationHandler = {
  name: "className",
  Block: ({ annotation, children }) => (
    <span className={annotation.data || annotation.query}>{children}</span>
  ),
  Inline: ({ annotation, children }) => (
    <span className={annotation.data || annotation.query}>{children}</span>
  ),
}
