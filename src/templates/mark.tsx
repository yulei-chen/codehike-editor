/* MDX Snippet:
```js
function lorem(ipsum, dolor = 1) {
  // !mark
  return dolor
}

function ipsum(lorem, dolor = 1) {
  // !mark(1:2) gold
  const sit = lorem == null ? 0 : lorem.sit
  dolor = sit - amet(dolor)
  // !mark[/sit/] pink
  return sit ? consectetur(lorem) : []
}
```
*/

import { AnnotationHandler, InnerLine } from "codehike/code"

export const mark: AnnotationHandler = {
  name: "mark",
  Line: ({ annotation, ...props }) => {
    const color = annotation?.query || "rgb(14 165 233)"
    return (
      <div
        className="flex"
        style={{
          borderLeft: "solid 2px transparent",
          borderLeftColor: annotation && color,
          backgroundColor: annotation && `rgb(from ${color} r g b / 0.1)`,
        }}
      >
        <InnerLine merge={props} className="px-2 flex-1" />
      </div>
    )
  },
  Inline: ({ annotation, children }) => {
    const color = annotation?.query || "rgb(14 165 233)"
    return (
      <span
        className="rounded px-0.5 py-0 -mx-0.5"
        style={{
          outline: `solid 1px rgb(from ${color} r g b / 0.5)`,
          background: `rgb(from ${color} r g b / 0.13)`,
        }}
      >
        {children}
      </span>
    )
  },
}
