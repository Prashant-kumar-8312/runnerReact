import { useMemo, useState } from "react";

// const languageByExtension = {
//   css: "css",
//   html: "html",
//   js: "javascript",
//   jsx: "javascript",
//   json: "json",
//   md: "markdown",
//   py: "python",
//   ts: "typescript",
//   tsx: "typescript",
// };


const languageByExtension = {
  // Web development
  html: "html",
  css: "css",
  js: "javascript",
  jsx: "javascript",
  mjs: "javascript",
  ts: "typescript",
  tsx: "typescript",

  // Data and documentation
  json: "json",
  md: "markdown",
  txt: "plaintext",

  // Python
  py: "python",
  pyw: "python",

  // C and C++
  c: "c",
  h: "c",
  cpp: "cpp",
  cc: "cpp",
  cxx: "cpp",
  hpp: "cpp",
  hxx: "cpp",

  // Other languages
  // java: "java",
  // dart: "dart",
  // go: "go",
  // rs: "rust",
  // php: "php",
  // rb: "ruby",
};




function getLanguage(fileName) {
  const extension = fileName.split(".").pop()?.toLowerCase();
  return languageByExtension[extension] || "plaintext";
}

export default function Explorer({
  files,
  activeFile,
  onSelect,
  onCreate,
  onDelete,
}) {
  const [query, setQuery] = useState("");
  const [newFileName, setNewFileName] = useState("");
  const [isCreating, setIsCreating] = useState(false);

  const filteredFiles = useMemo(() => {
    const normalizedQuery = query.trim().toLowerCase();
    if (!normalizedQuery) return files;
    return files.filter((file) => file.name.toLowerCase().includes(normalizedQuery));
  }, [files, query]);

  const createFile = async (event) => {
    event.preventDefault();
    const name = newFileName.trim();
    if (!name) return;

    setIsCreating(true);
    try {
      await onCreate({ name, path: name, language: getLanguage(name), content: "" });
      setNewFileName("");
    } finally {
      setIsCreating(false);
    }
  };

  return (
    <aside className="flex h-full w-full min-w-0 flex-col border-r border-[#27354a] bg-[#111a2a] text-[#c4cfdd] md:w-64 md:shrink-0" aria-label="File explorer">
      <div className="flex items-center justify-between border-b border-[#27354a] px-4 py-4">
        <div>
          <p className="text-[11px] font-bold uppercase tracking-[0.2em] text-[#8797a8]">Project</p>
          <h2 className="mt-1 text-sm font-semibold text-white">Files</h2>
        </div>
        <button type="button" onClick={() => setIsCreating((current) => !current)} className="flex h-8 w-8 items-center justify-center rounded-md text-lg text-[#ec8a72] transition hover:bg-[#223047] hover:text-white" aria-label="Create a new file" title="Create a new file">
          +
        </button>
      </div>

      <div className="border-b border-[#27354a] p-3">
        <label className="relative block">
          <span className="sr-only">Search files</span>
          <input value={query} onChange={(event) => setQuery(event.target.value)} placeholder="Search files" className="w-full rounded-md border border-[#30415b] bg-[#182338] px-3 py-2 text-sm text-white outline-none placeholder:text-[#718198] focus:border-[#ec8a72]" />
        </label>
        {isCreating && <form onSubmit={createFile} className="mt-3 rounded-md border border-[#30415b] bg-[#182338] p-3"><label className="block text-xs font-semibold text-[#c4cfdd]">New file<input autoFocus value={newFileName} onChange={(event) => setNewFileName(event.target.value)} placeholder="index.js" className="mt-2 w-full rounded border border-[#40536f] bg-[#111a2a] px-2.5 py-2 text-sm text-white outline-none focus:border-[#ec8a72]" /></label><button disabled={isCreating || !newFileName.trim()} className="mt-2 w-full rounded bg-[#ec5b3f] px-3 py-2 text-xs font-bold text-white transition hover:bg-[#d94c31] disabled:cursor-not-allowed disabled:opacity-50">{isCreating ? "Creating..." : "Create file"}</button></form>}
      </div>

      <div className="min-h-0 flex-1 overflow-y-auto p-2">
        {filteredFiles.length === 0 ? <div className="px-3 py-8 text-center text-sm text-[#718198]">{files.length === 0 ? "No files yet" : "No matching files"}</div> : filteredFiles.map((file) => <div key={file._id} className={`group flex items-center gap-2 rounded-md px-3 py-2 text-sm transition ${activeFile?._id === file._id ? "bg-[#293b57] text-white" : "text-[#aebbc9] hover:bg-[#1d2b41] hover:text-white"}`}><button type="button" onClick={() => onSelect(file)} className="flex min-w-0 flex-1 items-center gap-2 text-left"><span className="font-mono text-xs text-[#ec8a72]">{file.name.split(".").pop()?.toUpperCase() || "FILE"}</span><span className="truncate">{file.name}</span></button><button type="button" onClick={() => onDelete(file)} className="hidden h-6 w-6 shrink-0 rounded text-[#718198] hover:bg-[#492e3a] hover:text-[#ff9f8c] group-hover:block" aria-label={`Delete ${file.name}`} title={`Delete ${file.name}`}>&times;</button></div>)}
      </div>
      <div className="border-t border-[#27354a] px-4 py-3 text-xs text-[#718198]">{files.length} {files.length === 1 ? "file" : "files"}</div>
    </aside>
  );
}