/* MDX Snippet:
## !!steps Step One

Content for step one. Scroll down to see the code update.

```js ! example.js
function hello() {
  return "world"
}
```

## !!steps Step Two

Content for step two.

```js ! example.js
function hello(name) {
  return `Hello ${name}`
}
```
*/

import { z } from "zod"
import { Block, CodeBlock, parseRoot } from "codehike/blocks"
import { Pre, RawCode, highlight } from "codehike/code"
import { Selection, SelectionProvider, Selectable } from "codehike/utils/selection"
import { tokenTransitions } from "./token-transitions"

const Schema = Block.extend({
  steps: z.array(Block.extend({ code: CodeBlock })),
})

export function Scrollycoding({ content }: { content: any }) {
  const { steps } = parseRoot(content, Schema)
  return (
    <SelectionProvider className="flex gap-4">
      <div className="flex-1 mt-32 mb-[90vh] ml-2 prose prose-invert">
        {steps.map((step, i) => (
          <Selectable
            key={i}
            index={i}
            selectOn={["click", "scroll"]}
            className="border-l-4 border-zinc-700 data-[selected=true]:border-blue-400 px-5 py-2 mb-24 rounded bg-zinc-900"
          >
            <h2 className="mt-4 text-xl">{step.title}</h2>
            <div>{step.children}</div>
          </Selectable>
        ))}
      </div>
      <div className="w-[40vw] max-w-xl bg-zinc-900">
        <div className="top-16 sticky overflow-auto">
          <Selection
            from={steps.map((step) => (
              <Code codeblock={step.code} />
            ))}
          />
        </div>
      </div>
    </SelectionProvider>
  )
}

async function Code({ codeblock }: { codeblock: RawCode }) {
  const highlighted = await highlight(codeblock, "github-dark")
  return (
    <Pre
      code={highlighted}
      handlers={[tokenTransitions]}
      className="min-h-[40rem]"
    />
  )
}
