/* MDX Snippet:
```ts
interface Greeter {
  greet(): string
}

function sayHello(greeter: Greeter) {
  console.log(greeter.greet())
}
```
*/

import { RawCode, Pre, highlight } from "codehike/code"
import ts from "typescript"

// Note: Requires TypeScript package: npm install typescript
// This is a React Server Component (RSC)
export async function Transpile({ codeblock }: { codeblock: RawCode }) {
  const result = ts.transpileModule(codeblock.value, {
    compilerOptions: {
      module: ts.ModuleKind.CommonJS,
      target: ts.ScriptTarget.ESNext,
    },
  })

  const [tsHighlighted, jsHighlighted] = await Promise.all([
    highlight(codeblock, "github-dark"),
    highlight(
      { ...codeblock, value: result.outputText, lang: "js" },
      "github-dark",
    ),
  ])

  return (
    <div className="rounded-lg overflow-hidden border border-zinc-700">
      <div className="grid grid-cols-2 divide-x divide-zinc-700">
        <div>
          <div className="px-4 py-2 bg-zinc-800 border-b border-zinc-700 text-xs text-zinc-400">
            TypeScript
          </div>
          <Pre code={tsHighlighted} className="m-0 px-4 py-3 bg-zinc-950 text-sm" />
        </div>
        <div>
          <div className="px-4 py-2 bg-zinc-800 border-b border-zinc-700 text-xs text-zinc-400">
            JavaScript
          </div>
          <Pre code={jsHighlighted} className="m-0 px-4 py-3 bg-zinc-950 text-sm" />
        </div>
      </div>
    </div>
  )
}
