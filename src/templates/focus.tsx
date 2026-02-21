/* MDX Snippet:
```js
// !focus(1:4)
function lorem(ipsum, dolor = 1) {
  const sit = ipsum == null ? 0 : ipsum.sit
  dolor = sit - amet(dolor)
  return sit ? consectetur(ipsum) : []
}
```
*/

import { AnnotationHandler, InnerLine } from "codehike/code"
import { PreWithFocus } from "./focus.client"

export const focus: AnnotationHandler = {
  name: "focus",
  onlyIfAnnotated: true,
  PreWithRef: PreWithFocus,
  Line: (props) => (
    <InnerLine merge={props} className="opacity-50 data-[focus]:opacity-100 px-2" />
  ),
  AnnotatedLine: ({ annotation, ...props }) => (
    <InnerLine merge={props} data-focus={true} className="bg-zinc-700/30" />
  ),
}
