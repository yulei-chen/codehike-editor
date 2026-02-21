/* MDX Snippet:
```tsx wordWrap
// This is a very long comment that demonstrates word wrapping when it exceeds the container width
const example = "This is a long string that demonstrates the word wrap feature in action"
```
*/

import { AnnotationHandler, InnerLine, InnerPre, InnerToken } from "codehike/code"

export const wordWrap: AnnotationHandler = {
  name: "word-wrap",
  Pre: (props) => <InnerPre merge={props} className="whitespace-pre-wrap" />,
  Line: (props) => (
    <InnerLine merge={props}>
      <div
        style={{
          textIndent: `${-props.indentation}ch`,
          marginLeft: `${props.indentation}ch`,
        }}
      >
        {props.children}
      </div>
    </InnerLine>
  ),
  Token: (props) => <InnerToken merge={props} style={{ textIndent: 0 }} />,
}
