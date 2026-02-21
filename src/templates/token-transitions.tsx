/* MDX Snippet:
```js
function lorem(ipsum, dolor = 1) {
  const sit = ipsum == null ? 0 : ipsum.sit
  dolor = sit - amet(dolor)
  return sit ? consectetur(ipsum) : []
}
```
*/

import { AnnotationHandler, InnerToken } from "codehike/code"
import { SmoothPre } from "./smooth-pre"

export const tokenTransitions: AnnotationHandler = {
  name: "token-transitions",
  PreWithRef: SmoothPre,
  Token: (props) => (
    <InnerToken merge={props} style={{ display: "inline-block" }} />
  ),
}
