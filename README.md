# codehike-editor

[![npm version](https://img.shields.io/npm/v/codehike-editor.svg)](https://www.npmjs.com/package/codehike-editor)
[![License: MIT](https://img.shields.io/badge/License-MIT-blue.svg)](https://opensource.org/licenses/MIT)

A visual editor for [Code Hike](https://codehike.org)-powered MDX content. Edit your MDX files with a editor and insert Code Hike components (focus, mark, collapse, etc.) with a single click.

## Prerequisites

Code Hike is installed with

```bash
npx create-next-app -e https://github.com/code-hike/v1-starter
```

## Quick Start

Run this from the root of your Code Hike project:

```bash
npx codehike-editor init
```

Then start your project and the editor:

```bash
npm install
npm run dev      # Start your Next.js app with Code Hike 
npm run editor   # Start the visual editor
```

Open two tabs: your site at **http://localhost:3000** and the editor at **http://localhost:4321**.

## Features

- MDX editor powered by CodeMirror
- File tree sidebar for browsing your `app/` directory
- Per-line "+" button to insert Code Hike components
- Auto-injects annotation handlers into your `components/code.tsx`
- Auto-registers MDX components in `mdx-components.tsx` when needed
- Auto-saves on edit
- Dependency prompts for components requiring external packages (e.g. shadcn/ui)

## Usage



## Available Components (WIP)

| Component | Description |
|-----------|-------------|
| Callout | Inline callout annotations in code |
| ClassName | Apply CSS classes to code lines/tokens |
| Code Mentions | Hover-linked text that highlights code lines |
| Collapse | Collapsible code sections (requires shadcn) |
| Copy Button | Copy-to-clipboard button on code blocks |
| Diff | Show added/removed lines |
| File Name | Display filename above code blocks |
| Focus | Highlight specific lines, dim others |
| Fold | Fold/unfold inline code sections |
| Line Numbers | Custom line number display |
| Link | Clickable links in code |
| Mark | Highlight lines or tokens with color |
| Tooltip | Hover tooltips on code (requires shadcn) |
| Scrollycoding | Scroll-driven code walkthrough |
| Slideshow | Step-through code slides |
| Spotlight | Spotlight-style code presentation |

## License

[MIT LICENSE](LICENSE).
