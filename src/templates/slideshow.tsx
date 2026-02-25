/* MDX Snippet:
## !!steps

Content for slide one.

```js !
function hello() {
  return "world"
}
```

## !!steps

Content for slide two.

```js !
function hello(name) {
  return `Hello ${name}`
}
```
*/

import { z } from "zod"
import { Block, CodeBlock, parseRoot } from "codehike/blocks"
import { Pre, RawCode, highlight } from "codehike/code"
import { Selection, SelectionProvider } from "codehike/utils/selection"
import { tokenTransitions } from "./token-transitions"
import { Controls } from "./slideshow.client"

const Schema = Block.extend({
  steps: z.array(Block.extend({ code: CodeBlock })),
})

export function Slideshow({ content }: { content: any }) {
  const { steps } = parseRoot(content, Schema)
  return (
    <SelectionProvider>
      <Selection
        from={steps.map((step) => (
          <Code codeblock={step.code} />
        ))}
      />
      <Controls length={steps.length} />
      <div className="px-4">
        <Selection from={steps.map((step) => step.children)} />
      </div>
    </SelectionProvider>
  )
}

async function Code({ codeblock }: { codeblock: RawCode }) {
  const highlighted = await highlight(codeblock, "github-dark")
  return (
    <Pre
      code={highlighted}
      className="min-h-[15rem] !bg-zinc-900 m-0 mb-4 rounded-none p-2"
      handlers={[tokenTransitions]}
    />
  )
}
