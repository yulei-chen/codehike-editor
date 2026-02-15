import React, {
  useCallback,
  useMemo,
  useState,
  useEffect,
  useRef
} from 'react';
import CodeMirror from '@uiw/react-codemirror';
import { markdown } from '@codemirror/lang-markdown';
import { EditorView } from '@codemirror/view';
import { InsertionPoint } from '../Insertion/InsertionPoint';

type InjectionTipType = 'success' | 'error';

interface LinePosition {
  lineNumber: number;
  top: number;
  height: number;
}

interface MarkdownEditorProps {
  content: string;
  onChange: (content: string) => void;
  onInsert?: (position: number, text: string) => void;
}

export function MarkdownEditor({
  content,
  onChange,
  onInsert
}: MarkdownEditorProps) {
  const [linePositions, setLinePositions] = useState<LinePosition[]>([]);
  const [injectionTip, setInjectionTip] = useState<{
    message: string;
    type: InjectionTipType;
  } | null>(null);
  const injectionTipTimeoutRef = useRef<ReturnType<typeof setTimeout> | null>(
    null
  );
  const overlayRef = useRef<HTMLDivElement>(null);
  const viewRef = useRef<EditorView | null>(null);

  const showInjectionTip = useCallback(
    (message: string, type: InjectionTipType) => {
      if (injectionTipTimeoutRef.current) {
        clearTimeout(injectionTipTimeoutRef.current);
      }
      setInjectionTip({ message, type });
      injectionTipTimeoutRef.current = setTimeout(() => {
        setInjectionTip(null);
        injectionTipTimeoutRef.current = null;
      }, 4000);
    },
    []
  );

  const handleChange = useCallback(
    (value: string) => {
      onChange(value);
    },
    [onChange]
  );

  const handleInsert = useCallback(
    (lineNumber: number, text: string) => {
      const lines = content.split('\n');
      const newLines = [
        ...lines.slice(0, lineNumber),
        text,
        ...lines.slice(lineNumber)
      ];
      onChange(newLines.join('\n'));
    },
    [content, onChange]
  );

  // Custom theme matching our dark UI
  const theme = useMemo(
    () =>
      EditorView.theme({
        '&': {
          backgroundColor: '#1e1e2e',
          color: '#cdd6f4'
        },
        '.cm-content': {
          caretColor: '#89b4fa'
        },
        '.cm-cursor': {
          borderLeftColor: '#89b4fa'
        },
        '&.cm-focused .cm-selectionBackground, .cm-selectionBackground': {
          backgroundColor: 'rgba(137, 180, 250, 0.3)'
        },
        '.cm-gutters': {
          backgroundColor: '#1e1e2e',
          color: '#6c7086',
          borderRight: '1px solid #313244'
        },
        '.cm-activeLineGutter': {
          backgroundColor: 'rgba(137, 180, 250, 0.1)'
        },
        '.cm-activeLine': {
          backgroundColor: 'rgba(137, 180, 250, 0.05)'
        }
      }),
    []
  );

  // Parse content to find paragraph gaps for insertion points
  const insertionPoints = useMemo(() => {
    const lines = content.split('\n');
    const points: number[] = [];

    // Add insertion point at the beginning
    points.push(0);

    for (let i = 0; i < lines.length; i++) {
      const line = lines[i].trim();
      const nextLine = lines[i + 1]?.trim();

      // Add insertion point after empty lines that follow content
      if (line === '' && i > 0 && lines[i - 1].trim() !== '') {
        points.push(i);
      }

      // Add insertion point after paragraphs (non-empty line followed by empty line)
      if (line !== '' && nextLine === '') {
        points.push(i + 1);
      }
    }

    // Add insertion point at the end
    if (!points.includes(lines.length)) {
      points.push(lines.length);
    }

    return [...new Set(points)].sort((a, b) => a - b);
  }, [content]);

  // Compute line positions when view is available
  const updateLinePositions = useCallback(() => {
    const view = viewRef.current;
    const overlay = overlayRef.current;
    if (!view || !overlay) return;

    const overlayRect = overlay.getBoundingClientRect();
    const positions: LinePosition[] = [];

    try {
      const { doc } = view.state;
      for (const lineNum of insertionPoints) {
        let pos: number;
        let useTop = true;
        if (lineNum === 0) {
          pos = 0;
        } else if (lineNum >= doc.lines) {
          pos = doc.length;
          useTop = false; // Use bottom of last line for end insertion
        } else {
          const line = doc.line(lineNum);
          pos = line.from;
        }

        const block = view.lineBlockAt(Math.min(pos, doc.length));
        const coords = view.coordsAtPos(pos, 1);
        if (coords) {
          const top = useTop
            ? coords.top - overlayRect.top
            : coords.bottom - overlayRect.top - 24;
          positions.push({
            lineNumber: lineNum,
            top,
            height: Math.max(block.height, 24)
          });
        }
      }
      setLinePositions(positions);
    } catch {
      // Ignore errors during initial render
    }
  }, [insertionPoints]);

  const handleCreateEditor = useCallback((view: EditorView) => {
    viewRef.current = view;
    // Defer to next frame so layout is complete
    requestAnimationFrame(() => updateLinePositions());
  }, [updateLinePositions]);

  useEffect(() => {
    updateLinePositions();
  }, [updateLinePositions, content]);

  // Update positions on scroll and resize
  useEffect(() => {
    const overlay = overlayRef.current;
    const view = viewRef.current;
    if (!overlay || !view) return;

    const scroller = view.scrollDOM;
    const resizeObserver = new ResizeObserver(updateLinePositions);
    resizeObserver.observe(overlay);

    const handleScroll = () => {
      requestAnimationFrame(updateLinePositions);
    };
    scroller.addEventListener('scroll', handleScroll);

    return () => {
      resizeObserver.disconnect();
      scroller.removeEventListener('scroll', handleScroll);
    };
  }, [updateLinePositions]);

  return (
    <div className="h-full flex flex-col relative">
      <div className="flex-1 overflow-hidden relative">
        <CodeMirror
          value={content}
          onChange={handleChange}
          onCreateEditor={handleCreateEditor}
          extensions={[markdown(), theme]}
          className="h-full"
          basicSetup={{
            lineNumbers: true,
            highlightActiveLineGutter: true,
            highlightActiveLine: true,
            foldGutter: true,
            dropCursor: true,
            indentOnInput: true,
            bracketMatching: true,
            autocompletion: true
          }}
        />
        {/* Overlay for insertion points - positioned over the editor, hover zones for gaps */}
        <div
          ref={overlayRef}
          className="absolute inset-0 pointer-events-none overflow-hidden"
        >
          {linePositions.map(({ lineNumber, top, height }) => (
            <div
              key={lineNumber}
              className="pointer-events-auto absolute left-0 right-0 flex items-center"
              style={{
                top: `${top}px`,
                height: `${height}px`,
                minHeight: '24px'
              }}
            >
              <InsertionPoint
                lineNumber={lineNumber}
                onInsert={handleInsert}
                onShowTip={showInjectionTip}
              />
            </div>
          ))}
        </div>
      </div>
      {injectionTip && (
        <div
          className={`fixed bottom-6 left-1/2 -translate-x-1/2 z-[60] px-4 py-2.5 rounded-lg shadow-lg text-sm font-medium flex items-center gap-2 ${
            injectionTip.type === 'success'
              ? 'bg-ch-success/90 text-white'
              : 'bg-ch-error/90 text-white'
          }`}
          role="status"
        >
          {injectionTip.type === 'success' ? (
            <svg
              className="w-4 h-4 shrink-0"
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              strokeWidth="2"
            >
              <path d="M20 6L9 17l-5-5" />
            </svg>
          ) : (
            <svg
              className="w-4 h-4 shrink-0"
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              strokeWidth="2"
            >
              <path d="M18 6L6 18M6 6l12 12" />
            </svg>
          )}
          {injectionTip.message}
        </div>
      )}
    </div>
  );
}
