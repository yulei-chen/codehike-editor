import { AnnotationHandler, InnerLine } from "codehike/code"
import { PreWithFocus } from "./focus.client"

/**
 * Focus annotation: dim unfocused code and scroll to focused lines.
 * Usage: // !focus[fromLine:toLine] or // !focus on a line
 * Pass focus handler to Pre; it uses PreWithFocus for scroll behavior.
 */
export const focus: AnnotationHandler = {
  name: "focus",
  onlyIfAnnotated: true,
  PreWithRef: PreWithFocus,
  Line: (lineProps) => (
    <div data-focus={false} className="opacity-100">
      <InnerLine merge={lineProps} {...lineProps} />
    </div>
  ),
  AnnotatedLine: (lineProps) => (
    <div data-focus="true" className="opacity-100">
      <InnerLine merge={lineProps} {...lineProps} />
    </div>
  ),
}
