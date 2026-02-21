/* MDX Snippet:
<CodeWithTabs>

```js !!tabs main.js
function lorem(ipsum, dolor = 1) {
  const sit = ipsum == null ? 0 : ipsum.sit
  dolor = sit - amet(dolor)
  return sit ? consectetur(ipsum) : []
}
```

```css !!tabs styles.css
body {
  margin: 0;
  padding: 0;
}
```

</CodeWithTabs>
*/

import { Block, CodeBlock, parseProps } from "codehike/blocks"
import { Pre, highlight } from "codehike/code"
import { z } from "zod"
import { CodeTabs } from "./tabs.client"

const Schema = Block.extend({
  tabs: z.array(CodeBlock),
})

export async function CodeWithTabs(props: unknown) {
  const { tabs } = parseProps(props, Schema)
  const highlighted = await Promise.all(
    tabs.map((tab) => highlight(tab, "github-dark")),
  )
  return <CodeTabs tabs={highlighted} />
}
