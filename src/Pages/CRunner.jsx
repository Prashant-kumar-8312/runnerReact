
import { useState } from "react";
import api from "../Services/api";

export default function CRunner({ code }) {
  const [input, setInput] = useState("");
  const [output, setOutput] = useState("");
  const [status, setStatus] = useState("Ready");
  const [running, setRunning] = useState(false);

  async function runCode() {
    if (running) return;

    setRunning(true);
    setOutput("");
    setStatus("Submitting to JDoodle...");

    try {
      const response = await api.post("/execute/c", {
        sourceCode: code,
        input,
      });

      const result = response.data;
      const details = [
        `Status: ${result.status}`,
        result.stdout && `Output:\n${result.stdout}`,
        result.compile_output &&
          `Compilation errors:\n${result.compile_output}`,
        result.stderr && `Runtime errors:\n${result.stderr}`,
        result.message && `Message:\n${result.message}`,
      ].filter(Boolean);

      setOutput(details.join("\n\n") || "Program finished without output.");
      setStatus(result.status || "Finished");
    } catch (error) {
      setStatus("Execution failed");
      setOutput(
        error.response?.data?.message ||
          error.message ||
          "Could not connect to the C execution API."
      );
    } finally {
      setRunning(false);
    }
  }

  return (
    <section className="flex h-full min-h-0 flex-col bg-[#111a2a] text-[#c4cfdd]">
      <div className="flex items-center justify-between border-b border-[#27354a] px-4 py-3">
        <div>
          <h3 className="text-sm font-semibold text-white">C Console</h3>
          <p className="mt-1 text-xs text-[#9aabc0]">{status}</p>
        </div>

        <button
          type="button"
          onClick={runCode}
          disabled={running}
          className="rounded bg-[#ec5b3f] px-3 py-1.5 text-xs font-semibold text-white disabled:opacity-50"
        >
          {running ? "Running..." : "Run C"}
        </button>
      </div>

      <label className="p-3 pb-0 text-xs text-[#9aabc0]">
        Standard input (stdin)
        <textarea
          value={input}
          onChange={(event) => setInput(event.target.value)}
          placeholder="Enter program input here..."
          className="mt-2 min-h-16 w-full rounded border border-[#30415b] bg-[#182338] p-2 text-sm text-white outline-none focus:border-[#ec8a72]"
        />
      </label>

      <div className="min-h-0 flex-1 overflow-auto p-3">
        <pre className="whitespace-pre-wrap break-words font-mono text-xs leading-6">
          {output || "Compiler output will appear here."}
        </pre>
      </div>
    </section>
  );
}
