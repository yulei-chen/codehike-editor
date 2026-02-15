/* MDX Snippet:
<HoverContainer>

The [base case](hover:one) returns 1.

```cpp
int factorial(int n) {
  if (n == 0) {
    // !hover one
    return 1;
  } else {
    // !hover two
    return n * factorial(n - 1);
  }
}
```

The [recursive case](hover:two) multiplies something.

</HoverContainer>
*/

import { AnnotationHandler, InnerLine } from "codehike/code"
import React from "react"

export function HoverContainer(props: { children: React.ReactNode }) {
  return <div className="hover-container">{props.children}</div>
}

export function Link(props: { href?: string; children?: React.ReactNode }) {
  if (props.href?.startsWith("hover:")) {
    const hover = props.href.slice("hover:".length)
    return (
      <span
        className="underline decoration-dotted underline-offset-4"
        data-hover={hover}
      >
        {props.children}
      </span>
    )
  }
  return <a {...props} />
}

export const hover: AnnotationHandler = {
  name: "hover",
  onlyIfAnnotated: true,
  Line: ({ annotation, ...props }) => (
    <InnerLine
      merge={props}
      className="transition-opacity"
      data-line={annotation?.query || ""}
    />
  ),
}
