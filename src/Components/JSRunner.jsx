
import { useEffect, useRef, useState } from "react";
import { Play, Trash2, Terminal, LoaderCircle } from "lucide-react";

export default function JSRunner({ code }) {
  const [output, setOutput] = useState([]);
  const [runDocument, setRunDocument] = useState("");
  const [runId, setRunId] = useState(0);
  const [running, setRunning] = useState(false);
  const iframeRef = useRef(null);
  const timeoutRef = useRef(null);

  useEffect(() => {
    function handleMessage(event) {
      if (event.source !== iframeRef.current?.contentWindow) return;
      if (event.data?.type !== "codo-output") return;
      if (event.data?.runId !== runId) return;

      if (event.data.kind === "done") {
        clearTimeout(timeoutRef.current);
        setRunning(false);
        return;
      }

      setOutput((current) => [
        ...current,
        {
          kind: event.data.kind,
          text: String(event.data.text),
        },
      ]);
    }

    window.addEventListener("message", handleMessage);
    return () => {
      window.removeEventListener("message", handleMessage);
      clearTimeout(timeoutRef.current);
    };
  }, [runId]);

  function runCode() {
    clearTimeout(timeoutRef.current);

    const nextRunId = runId + 1;
    setRunId(nextRunId);
    setOutput([]);
    setRunning(true);

    // Escape "<" to prevent code from closing the HTML script tag.
    const safeCode = JSON.stringify(code).replace(/</g, "\\u003c");

    const documentHTML = `
      <!doctype html>
      <html>
        <body>
          <script>
            (() => {
              const runId = ${nextRunId};
              const send = (kind, text) => {
                parent.postMessage({
                  type: "codo-output",
                  runId,
                  kind,
                  text: String(text)
                }, "*");
              };

              const format = (value) => {
                if (typeof value === "string") return value;
                try {
                  const result = JSON.stringify(value);
                  return result === undefined ? String(value) : result;
                } catch {
                  return String(value);
                }
              };

              ["log", "info", "warn", "error"].forEach((kind) => {
                console[kind] = (...args) => {
                  send(kind, args.map(format).join(" "));
                };
              });

              window.onerror = (message, source, line, column) => {
                send("error", message + " (line " + line + ")");
              };

              try {
                const userCode = ${safeCode};
                new Function(userCode)();
              } catch (error) {
                send("error", error.stack || error.message || error);
              } finally {
                send("done", "");
              }
            })();
          </script>
        </body>
      </html>
    `;

    setRunDocument(documentHTML);

    // Stop waiting if a program never finishes.
    timeoutRef.current = setTimeout(() => {
      setOutput((current) => [
        ...current,
        {
          kind: "error",
          text: "Execution timed out. The runner will reset.",
        },
      ]);
      setRunning(false);
      setRunDocument("");
    }, 3000);
  }

  function clearConsole() {
    setOutput([]);
  }

  return (
    <section className="flex min-h-52 flex-col border-t border-white/10 bg-[#0e111b]">
      <div className="flex items-center justify-between border-b border-white/10 px-4 py-3">
        <div className="flex items-center gap-2 text-sm font-medium">
          <Terminal size={16} className="text-blue-400" />
          JavaScript Console
        </div>

        <div className="flex items-center gap-2">
          <button
            onClick={clearConsole}
            className="rounded-md p-2 text-slate-400 hover:bg-white/10"
            title="Clear console"
          >
            <Trash2 size={15} />
          </button>

          <button
            onClick={runCode}
            disabled={running}
            className="flex items-center gap-2 rounded-md bg-emerald-600 px-3 py-2 text-sm font-medium text-white hover:bg-emerald-500 disabled:opacity-50"
          >
            {running ? (
              <LoaderCircle size={15} className="animate-spin" />
            ) : (
              <Play size={15} />
            )}
            {running ? "Running..." : "Run"}
          </button>
        </div>
      </div>

      <div className="min-h-28 flex-1 overflow-auto p-4 font-mono text-sm">
        {output.length === 0 && !running && (
          <p className="text-slate-500">
            Click Run to execute your JavaScript.
          </p>
        )}

        {output.map((item, index) => (
          <pre
            key={`${index}-${item.kind}`}
            className={`whitespace-pre-wrap break-words ${
              item.kind === "error"
                ? "text-red-400"
                : item.kind === "warn"
                ? "text-amber-300"
                : "text-slate-200"
            }`}
          >
            {item.text}
          </pre>
        ))}

        {running && (
          <p className="mt-2 text-slate-500">Executing code...</p>
        )}
      </div>

      {/* Sandboxed execution environment */}
      <iframe
        key={runId}
        ref={iframeRef}
        title="JavaScript execution sandbox"
        sandbox="allow-scripts"
        srcDoc={runDocument || "<!doctype html><html><body></body></html>"}
        className="hidden"
      />
    </section>
  );
}
