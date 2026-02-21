"use client"

import { HighlightedCode, Pre } from "codehike/code"
import { useState } from "react"

export function Code({ highlighted }: { highlighted: HighlightedCode[] }) {
  const [selectedLang, setSelectedLang] = useState(highlighted[0].lang)
  const selectedCode =
    highlighted.find((code) => code.lang === selectedLang) ?? highlighted[0]

  return (
    <div className="relative rounded-lg overflow-hidden border border-zinc-700">
      <Pre code={selectedCode} className="m-0 px-4 py-3 bg-zinc-950" />
      <div className="absolute top-2 right-2">
        <select
          value={selectedLang}
          onChange={(e) => setSelectedLang(e.target.value)}
          className="bg-zinc-800 text-zinc-300 text-sm border border-zinc-600 rounded px-2 py-1"
        >
          {highlighted.map(({ lang }) => (
            <option key={lang} value={lang}>
              {lang}
            </option>
          ))}
        </select>
      </div>
    </div>
  )
}
