/* MDX Snippet:
```js
function lorem(ipsum, dolor = 1) {
  const sit = ipsum == null ? 0 : ipsum.sit
  // !link[/ipsum/] https://example.com
  return sit ? consectetur(ipsum) : []
}
```
*/

import { AnnotationHandler } from "codehike/code"

export const link: AnnotationHandler = {
  name: "link",
  Inline: ({ annotation, children }) => {
    const { query } = annotation
    return <a href={query}>{children}</a>
  },
}
