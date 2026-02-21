/* MDX Snippet:
```ts twoslash
interface User {
  name: string
  age: number
}

const user: User = { name: "Alice", age: 30 }
//    ^?
```
*/

import {
  AnnotationHandler,
  InlineAnnotation,
  Pre,
  RawCode,
  highlight,
} from "codehike/code"
import { createTwoslasher } from "twoslash"

// Note: Requires twoslash package: npm install twoslash
// This is a React Server Component (RSC)
const twoslasher = createTwoslasher()

export async function Code({ codeblock }: { codeblock: RawCode }) {
  const twoslash = twoslasher(codeblock.value, codeblock.lang)
  const highlighted = await highlight(codeblock, "github-dark")

  highlighted.annotations = [
    ...highlighted.annotations,
    ...twoslash.hovers.map((hover) => ({
      name: "hover",
      query: hover.text,
      fromLineNumber: hover.line + 1,
      toLineNumber: hover.line + 1,
      fromColumn: hover.character,
      toColumn: hover.character + hover.length,
    })),
    ...twoslash.queries.map((q) => ({
      name: "query",
      query: q.text,
      fromLineNumber: q.line,
      toLineNumber: q.line,
      fromColumn: q.character,
      toColumn: q.character + 1,
    })),
  ]

  return <Pre code={highlighted} handlers={[hover, query]} />
}

const hover: AnnotationHandler = {
  name: "hover",
  Inline: ({ annotation, children }) => (
    <span className="group relative">
      <span className="underline decoration-dotted decoration-zinc-400 cursor-help">
        {children}
      </span>
      <span className="hidden group-hover:block absolute z-10 bottom-full left-0 mb-1 px-2 py-1 bg-zinc-800 border border-zinc-600 rounded text-sm text-zinc-200 whitespace-pre font-mono max-w-sm">
        {annotation.query}
      </span>
    </span>
  ),
}

const query: AnnotationHandler = {
  name: "query",
  transform: (annotation: InlineAnnotation) => ({
    name: annotation.name,
    query: annotation.query,
    fromLineNumber: annotation.lineNumber + 1,
    toLineNumber: annotation.lineNumber + 1,
    data: annotation.data,
  }),
  Block: ({ annotation, children }) => (
    <>
      {children}
      <div className="px-4 py-2 my-1 bg-zinc-800/50 border border-zinc-600 rounded text-sm text-zinc-200 font-mono">
        {annotation.query}
      </div>
    </>
  ),
}
