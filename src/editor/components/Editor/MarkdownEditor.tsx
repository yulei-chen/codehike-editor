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

interface LineInfo {
  lineNumber: number;
  top: number;
  height: number;
}

interface MarkdownEditorProps {
  content: string;
  onChange: (content: string) => void;
}

export function MarkdownEditor({ content, onChange }: MarkdownEditorProps) {
  const [allLines, setAllLines] = useState<LineInfo[]>([]);
  const [hoveredLine, setHoveredLine] = useState<number | null>(null);
  const [pickerLine, setPickerLine] = useState<number | null>(null);
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
      setPickerLine(null);
    },
    [content, onChange]
  );

  // Custom theme matching our dark UI — hide default line numbers since we use overlay
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
          borderRight: '1px solid #313244',
          minWidth: '48px'
        },
        '.cm-lineNumbers .cm-gutterElement': {
          paddingLeft: '24px',
          paddingRight: '8px'
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

  // Compute positions for every visible line
  const updateLinePositions = useCallback(() => {
    const view = viewRef.current;
    const overlay = overlayRef.current;
    if (!view || !overlay) return;

    const overlayRect = overlay.getBoundingClientRect();
    const lines: LineInfo[] = [];

    try {
      const { doc } = view.state;
      for (let i = 1; i <= doc.lines; i++) {
        const line = doc.line(i);
        const block = view.lineBlockAt(line.from);
        const coords = view.coordsAtPos(line.from, 1);
        if (coords) {
          lines.push({
            lineNumber: i,
            top: coords.top - overlayRect.top,
            height: block.height
          });
        }
      }
      setAllLines(lines);
    } catch {
      // Ignore errors during initial render
    }
  }, []);

  const handleCreateEditor = useCallback(
    (view: EditorView) => {
      viewRef.current = view;
      requestAnimationFrame(() => updateLinePositions());
    },
    [updateLinePositions]
  );

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

  // Track hovered line via native mousemove on the editor DOM
  const allLinesRef = useRef(allLines);
  allLinesRef.current = allLines;
  const pickerLineRef = useRef(pickerLine);
  pickerLineRef.current = pickerLine;

  useEffect(() => {
    const view = viewRef.current;
    const overlay = overlayRef.current;
    if (!view || !overlay) return;

    const editorDom = view.dom;

    const handleMouseMove = (e: MouseEvent) => {
      const rect = overlay.getBoundingClientRect();
      const y = e.clientY - rect.top;
      const lines = allLinesRef.current;
      const found = lines.find((l) => y >= l.top && y < l.top + l.height);
      setHoveredLine(found ? found.lineNumber : null);
    };

    const handleMouseLeave = (e: MouseEvent) => {
      // Don't clear hover if mouse moved onto the overlay (the "+" button)
      const relatedTarget = e.relatedTarget as Node | null;
      if (relatedTarget && overlay.contains(relatedTarget)) return;
      if (pickerLineRef.current !== null) return;
      setHoveredLine(null);
    };

    editorDom.addEventListener('mousemove', handleMouseMove);
    editorDom.addEventListener('mouseleave', handleMouseLeave);

    return () => {
      editorDom.removeEventListener('mousemove', handleMouseMove);
      editorDom.removeEventListener('mouseleave', handleMouseLeave);
    };
  }, [allLines.length > 0]);

  return (
    <div className="h-full flex flex-col relative">
      <div className="flex-1 overflow-hidden relative">
        <CodeMirror
          value={content}
          onChange={handleChange}
          onCreateEditor={handleCreateEditor}
          extensions={[markdown(), theme]}
          theme="dark"
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
        {/* Overlay for per-line "+" buttons — pointer-events:none so clicks pass through to editor */}
        <div
          ref={overlayRef}
          className="absolute inset-0 pointer-events-none overflow-hidden"
          style={{ zIndex: 5 }}
        >
          {allLines.map(({ lineNumber, top, height }) => (
            <div
              key={lineNumber}
              className="absolute left-0 flex items-center"
              style={{
                top: `${top}px`,
                height: `${height}px`,
                width: '24px'
              }}
            >
              {(hoveredLine === lineNumber || pickerLine === lineNumber) && (
                <div
                  className="pointer-events-auto w-full flex items-center justify-center"
                  onMouseLeave={(e) => {
                    // Don't clear if mouse went back to editor (mousemove will handle it)
                    // or if picker is open
                    const relatedTarget = e.relatedTarget as Node | null;
                    if (relatedTarget && viewRef.current?.dom.contains(relatedTarget)) return;
                    if (pickerLine !== null) return;
                    setHoveredLine(null);
                  }}
                >
                  <InsertionPoint
                    lineNumber={lineNumber}
                    onInsert={handleInsert}
                    onShowTip={showInjectionTip}
                    onPickerOpen={() => setPickerLine(lineNumber)}
                    onPickerClose={() => {
                      setPickerLine(null);
                      setHoveredLine(null);
                    }}
                  />
                </div>
              )}
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
