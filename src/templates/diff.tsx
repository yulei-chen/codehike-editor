/* MDX Snippet:
```js
function lorem(ipsum, dolor = 1) {
  const sit = ipsum == null ? 0 : ipsum.sit
  // !diff -
  dolor = ipsum - sit
  // !diff +
  dolor = sit - amet(dolor)
  return sit ? consectetur(ipsum) : []
}
```
*/

import { AnnotationHandler, InnerLine, BlockAnnotation } from "codehike/code"

export const diff: AnnotationHandler = {
  name: "diff",
  onlyIfAnnotated: true,
  transform: (annotation: BlockAnnotation) => {
    const color = annotation.query == "-" ? "#f85149" : "#3fb950"
    return [annotation, { ...annotation, name: "mark", query: color }]
  },
  Line: ({ annotation, ...props }) => (
    <>
      <div className="min-w-[1ch] box-content opacity-70 pl-2 select-none">
        {annotation?.query}
      </div>
      <InnerLine merge={props} />
    </>
  ),
}
