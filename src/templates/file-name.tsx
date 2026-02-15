import React from "react"

/**
 * File name / title for code blocks.
 * CodeHike docs: render highlighted.meta as title in your Code component:
 *
 *   async function Code({ codeblock }: { codeblock: RawCode }) {
 *     const highlighted = await highlight(codeblock, "github-dark")
 *     return (
 *       <div>
 *         {highlighted.meta && (
 *           <div className="px-4 py-2 bg-slate-800 border-b border-slate-700 text-sm text-slate-300">
 *             {highlighted.meta}
 *           </div>
 *         )}
 *         <Pre code={highlighted} handlers={[...]} />
 *       </div>
 *     )
 *   }
 *
 * This component is a presentational wrapper when you have a filename string.
 */
export function FileName({
  filename,
  children,
}: {
  filename: string
  children: React.ReactNode
}) {
  return (
    <div className="rounded-lg overflow-hidden border border-slate-700">
      <div className="flex items-center gap-2 px-4 py-2 bg-slate-800 border-b border-slate-700">
        <FileIcon filename={filename} />
        <span className="text-sm text-slate-300 font-medium">{filename}</span>
      </div>
      {children}
    </div>
  )
}

function FileIcon({ filename }: { filename: string }) {
  const ext = filename.split(".").pop() ?? ""
  const color =
    { tsx: "text-blue-400", ts: "text-blue-400", jsx: "text-yellow-400", js: "text-yellow-400", css: "text-pink-400" }[
      ext
    ] ?? "text-slate-400"
  return (
    <svg
      className={`w-4 h-4 ${color}`}
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="2"
    >
      <path d="M14 2H6a2 2 0 00-2 2v16a2 2 0 002 2h12a2 2 0 002-2V8z" />
      <path d="M14 2v6h6" />
    </svg>
  )
}
