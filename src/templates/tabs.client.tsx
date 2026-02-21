"use client"

import { HighlightedCode, Pre } from "codehike/code"
import { useState } from "react"

export function CodeTabs({ tabs }: { tabs: HighlightedCode[] }) {
  const [activeTab, setActiveTab] = useState(0)
  return (
    <div className="rounded-lg overflow-hidden border border-zinc-700">
      <div className="flex bg-zinc-800 border-b border-zinc-700">
        {tabs.map((tab, index) => (
          <button
            key={index}
            onClick={() => setActiveTab(index)}
            className={`px-4 py-2 text-sm font-medium transition-colors ${
              index === activeTab
                ? "bg-zinc-900 text-white"
                : "text-zinc-400 hover:text-zinc-200"
            }`}
          >
            {tab.meta}
          </button>
        ))}
      </div>
      <Pre code={tabs[activeTab]} className="m-0 px-4 py-3 bg-zinc-950" />
    </div>
  )
}
