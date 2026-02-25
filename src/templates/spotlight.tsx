/* MDX Snippet:
## !!steps Step One

Click to see the code on the right update.

```js ! example.js
function hello() {
  return "world"
}
```

## !!steps Step Two

Click to see the code on the right update.

```js ! example.js
function hello(name) {
  return `Hello ${name}`
}
```
*/

import { z } from "zod"
import { Block, CodeBlock, parseRoot } from "codehike/blocks"
import { RawCode, highlight } from "codehike/code"
import { Selection, SelectionProvider, Selectable } from "codehike/utils/selection"
import { tokenTransitions } from "./token-transitions"
import { SmoothPre } from "./smooth-pre"

const Schema = Block.extend({
  steps: z.array(Block.extend({ code: CodeBlock })),
})

export function Spotlight({ content }: { content: any }) {
  const { steps } = parseRoot(content, Schema)
  return (
    <SelectionProvider className="flex">
      <div className="flex-1 mt-4 ml-2 prose prose-invert prose-h2:mt-4">
        {steps.map((step, i) => (
          <Selectable
            key={i}
            index={i}
            selectOn={["click"]}
            className="border border-zinc-700 data-[selected=true]:border-blue-400 px-5 py-2 mb-4 rounded bg-zinc-900 cursor-pointer hover:bg-zinc-800 transition-colors duration-200 ease-in-out"
          >
            <h2 className="text-xl">{step.title}</h2>
            <div>{step.children}</div>
          </Selectable>
        ))}
      </div>
      <div className="w-[40vw] max-w-xl">
        <div className="top-16 sticky overflow-auto h-full p-4">
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
    <SmoothPre
      code={highlighted}
      handlers={[tokenTransitions]}
      className="max-h-[90vh] min-h-[38rem] bg-zinc-900 h-full m-0 border border-zinc-700"
    />
  )
}
