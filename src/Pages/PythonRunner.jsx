import { useEffect, useRef, useState } from "react";
import { loadPyodide } from "pyodide";

export default function PythonRunner({ code }) {
  const pyodideRef = useRef(null);
  const [status, setStatus] = useState("Loading Python runtime...");
  const [ready, setReady] = useState(false);
  const [running, setRunning] = useState(false);
  const [output, setOutput] = useState("");

  useEffect(() => {
    let cancelled = false;

    async function initializePython() {
      try {
        setStatus("Loading Pyodide...");

        const pyodide = await loadPyodide();

        if (cancelled) return;

        pyodide.setStdout({
          batched: (text) => {
            setOutput((previous) => previous + text + "\n");
          },
        });

        pyodide.setStderr({
          batched: (text) => {
            setOutput((previous) => previous + text + "\n");
          },
        });

        pyodideRef.current = pyodide;
        setReady(true);
        setStatus(`Python ready — ${pyodide.version}`);
      } catch (error) {
        if (cancelled) return;

        console.error("Pyodide initialization failed:", error);
        setStatus(`Python failed to load: ${error.message}`);
      }
    }

    initializePython();

    return () => {
      cancelled = true;
    };
  }, []);

  async function runCode() {
    const pyodide = pyodideRef.current;

    if (!pyodide || running) return;

    setRunning(true);
    setOutput("");

    try {
      await pyodide.runPythonAsync(code || 'print("Hello, Python!")');
    } catch (error) {
      setOutput(error.message || String(error));
    } finally {
      setRunning(false);
    }
  }

  return (
    <section className="flex h-full min-h-0 flex-col bg-[#111a2a] text-[#c4cfdd]">
      <div className="flex items-center justify-between gap-3 border-b border-[#27354a] px-4 py-3">
        <div className="min-w-0">
          <h3 className="text-sm font-semibold text-white">
            Python Console
          </h3>
          <p className="mt-1 truncate text-xs text-[#9aabc0]">
            {status}
          </p>
        </div>

        <div className="flex shrink-0 gap-2">
          <button
            type="button"
            onClick={() => setOutput("")}
            className="rounded border border-[#30415b] px-3 py-1.5 text-xs hover:bg-[#223047]"
          >
            Clear
          </button>

          <button
            type="button"
            onClick={runCode}
            disabled={!ready || running}
            className="rounded bg-[#ec5b3f] px-3 py-1.5 text-xs font-semibold text-white disabled:cursor-not-allowed disabled:opacity-50"
          >
            {running ? "Running..." : "Run Python"}
          </button>
        </div>
      </div>

      <div className="min-h-0 flex-1 overflow-auto p-3">
        <pre className="whitespace-pre-wrap break-words font-mono text-xs leading-6">
          {output || "Python output will appear here."}
        </pre>
      </div>
    </section>
  );
}