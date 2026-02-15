import { AnnotationHandler } from "codehike/code"

/**
 * Link annotation handler for Code Hike
 * Usage: // !link[/pattern/] https://example.com
 * The annotation query is the href (from block data/query).
 */
export const link: AnnotationHandler = {
  name: "link",
  Inline: ({ annotation, children }) => {
    const href = annotation.query ?? (annotation.data as string) ?? "#"
    return (
      <a
        href={href}
        target="_blank"
        rel="noopener noreferrer"
        className="text-blue-400 hover:text-blue-300 underline decoration-dotted underline-offset-2 cursor-pointer"
      >
        {children}
      </a>
    )
  },
}
