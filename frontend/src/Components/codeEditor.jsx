import Editor from "@monaco-editor/react";

export default function CodeEditor({
  file,
  onChange
}) {
  if (!file) {
    return (
      <div>
        Select a file
      </div>
    );
  }

  return (
    <Editor
      height="calc(100vh - 60px)"
      language={file.language}
      value={file.content}
      theme="vs-dark"
      onChange={(value) => {
        onChange(value || "");
      }}
      options={{
        minimap: {
          enabled: false
        },
        fontSize: 14,
        automaticLayout: true
      }}
    />
  );
}