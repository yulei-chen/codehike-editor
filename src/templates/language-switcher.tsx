/* MDX Snippet:
<CodeSwitcher>

```java !!code
public class Main {
  public static void main(String[] args) {
    System.out.println("Hello, World!");
  }
}
```

```py !!code
print("Hello, World!")
```

```js !!code
console.log("Hello, World!")
```

</CodeSwitcher>
*/

import { Block, CodeBlock, parseProps } from "codehike/blocks"
import { highlight } from "codehike/code"
import { z } from "zod"
import { Code } from "./language-switcher.client"

const Schema = Block.extend({
  code: z.array(CodeBlock),
})

export async function CodeSwitcher(props: unknown) {
  const { code } = parseProps(props, Schema)
  const highlighted = await Promise.all(
    code.map((codeblock) => highlight(codeblock, "github-dark")),
  )
  return <Code highlighted={highlighted} />
}
