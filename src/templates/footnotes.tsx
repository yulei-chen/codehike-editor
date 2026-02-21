/* MDX Snippet:
```rb
# !ref Library import
require 'sinatra'

# !ref URL mapping
get '/hi' do
  "Hello World!"
end
```
*/

import { AnnotationHandler, InnerLine } from "codehike/code"

export const footnotes: AnnotationHandler = {
  name: "ref",
  AnnotatedLine: ({ annotation, ...props }) => (
    <div className="flex gap-2">
      <InnerLine merge={props} />
      <Number n={annotation.data.n} />
    </div>
  ),
}

function Number({ n }: { n: number }) {
  return (
    <span
      data-value={n}
      className="after:content-[attr(data-value)] border border-slate-400 text-slate-400 text-xs rounded-full w-4 h-4 flex items-center justify-center flex-shrink-0 mt-1 select-none"
    />
  )
}
