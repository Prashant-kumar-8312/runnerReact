import { useState } from "react";
import { ExternalLink, Play, RefreshCw } from "lucide-react";

function getFile(files, name) {
  return files.find((file) => file.name.toLowerCase() === name);
}

function buildPreviewDocument(files) {
  const htmlFile = getFile(files, "index.html");
  const styleFile = getFile(files, "style.css");
  const scriptFile = getFile(files, "script.js");

  if (!htmlFile) return "";

  const parser = new DOMParser();
  const document = parser.parseFromString(htmlFile.content || "", "text/html");
  const style = styleFile?.content || "";
  const script = (scriptFile?.content || "").replace(/<\/script/gi, "<\\/script");

  document.querySelectorAll('link[rel="stylesheet"]').forEach((link) => {
    if (link.getAttribute("href")?.toLowerCase().endsWith("style.css")) {
      const styleElement = document.createElement("style");
      styleElement.textContent = style;
      link.replaceWith(styleElement);
    }
  });

  document.querySelectorAll("script[src]").forEach((scriptElement) => {
    if (scriptElement.getAttribute("src")?.toLowerCase().endsWith("script.js")) {
      const inlineScript = document.createElement("script");
      inlineScript.textContent = script;
      scriptElement.replaceWith(inlineScript);
    }
  });

  return `<!doctype html>${document.documentElement.outerHTML}`;
}

export default function WebsiteRunner({ files }) {
  const [previewDocument, setPreviewDocument] = useState(() =>
    buildPreviewDocument(files)
  );
  const [status, setStatus] = useState("Preview ready");

  function runWebsite() {
    const nextDocument = buildPreviewDocument(files);

    if (!nextDocument) {
      setStatus("index.html is required");
      return;
    }

    setPreviewDocument(nextDocument);
    setStatus("Preview updated");
  }

  function openPreviewInNewTab() {
    if (!previewDocument) return;

    const previewUrl = URL.createObjectURL(
      new Blob([previewDocument], { type: "text/html" })
    );
    const previewWindow = window.open(previewUrl, "_blank", "noopener,noreferrer");

    if (previewWindow) {
      window.setTimeout(() => URL.revokeObjectURL(previewUrl), 60000);
    } else {
      URL.revokeObjectURL(previewUrl);
      setStatus("Allow pop-ups to open the preview");
    }
  }

  return (
    <section className="flex h-full min-h-64 flex-col border-t border-white/10 bg-[#0e111b] text-slate-200">
      <div className="flex items-center justify-between gap-3 border-b border-white/10 px-4 py-3">
        <div className="min-w-0">
          <h3 className="text-sm font-semibold text-white">Website Preview</h3>
          <p className="mt-1 truncate text-xs text-slate-400">{status}</p>
        </div>

        <div className="flex shrink-0 items-center gap-2">
          {previewDocument && (
            <button
              type="button"
              onClick={openPreviewInNewTab}
              title="Open preview in a new tab"
              className="flex items-center gap-2 rounded-md border border-white/15 px-3 py-2 text-xs font-semibold text-slate-200 transition hover:border-white/30 hover:bg-white/5"
            >
              <ExternalLink size={14} />
              Preview
            </button>
          )}

          <button
            type="button"
            onClick={runWebsite}
            className="flex items-center gap-2 rounded-md bg-emerald-600 px-3 py-2 text-xs font-semibold text-white transition hover:bg-emerald-500"
          >
            {status === "Preview updated" ? <RefreshCw size={14} /> : <Play size={14} />}
            Run website
          </button>
        </div>
      </div>

      <div className="min-h-0 flex-1 bg-white p-2">
        {previewDocument ? (
          <iframe
            title="Website preview"
            sandbox="allow-scripts"
            srcDoc={previewDocument}
            className="h-full min-h-48 w-full border border-slate-200 bg-white"
          />
        ) : (
          <div className="grid h-full min-h-48 place-items-center text-sm text-slate-500">
            Create an index.html file to start the preview.
          </div>
        )}
      </div>
    </section>
  );
}
