import { useEffect, useState } from "react";
import { useParams } from "react-router-dom";

import api from "../Services/api";
import Explorer from "../Components/Explorer.jsx";

import CodeEditor from "../Components/codeEditor.jsx";

import CRunner from "./CRunner.jsx";

import PythonRunner from "./PythonRunner.jsx";
import WebsiteRunner from "../Components/WebsiteRunner.jsx";


function isPythonFile(file) {
  return /\.pyw?$/i.test(file?.name || "");
}

function isCFile(file) {
  return /\.c$/i.test(file?.name || "");
}

function isWebsiteProject(files) {
  const fileNames = new Set(files.map((file) => file.name.toLowerCase()));
  return ["index.html", "style.css", "script.js"].every((name) =>
    fileNames.has(name)
  );
}


export default function Workspace() {
  const { projectId } = useParams();

  const [files, setFiles] = useState([]);
  const [activeFile, setActiveFile] = useState(null);
  const [content, setContent] = useState("");
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    const loadFiles = async () => {
      try {
        const response = await api.get(
          `/files/project/${projectId}`
        );

        const loadedFiles = response.data.files;

        setFiles(loadedFiles);

        if (loadedFiles.length > 0) {
          setActiveFile(loadedFiles[0]);
          setContent(loadedFiles[0].content);
        }
      } catch (error) {
        console.error(error);
      }
    };

    loadFiles();
  }, [projectId]);

  const selectFile = (file) => {
    setActiveFile(file);
    setContent(file.content);
  };

  const saveFile = async () => {
    if (!activeFile) return;

    try {
      setSaving(true);

      const response = await api.put(
        `/files/${activeFile._id}`,
        {
          content
        }
      );

      const updatedFile = response.data.file;

      setFiles((prev) =>
        prev.map((file) =>
          file._id === updatedFile._id
            ? updatedFile
            : file
        )
      );

      setActiveFile(updatedFile);

      alert("File saved");
    } catch (error) {
      console.error(error);
    } finally {
      setSaving(false);
    }
  };

  const createFile = async (file) => {
    try {
      const response = await api.post(`/files/project/${projectId}`, file);
      const createdFile = response.data.file;
      setFiles((prev) => [...prev, createdFile]);
      setActiveFile(createdFile);
      setContent(createdFile.content || "");
    } catch (error) {
      console.error(error);
    }
  };

  const deleteFile = async (file) => {
    if (!window.confirm(`Delete ${file.name}?`)) return;

    try {
      await api.delete(`/files/${file._id}`);
      const remainingFiles = files.filter((item) => item._id !== file._id);
      setFiles(remainingFiles);
      if (activeFile?._id === file._id) {
        const nextFile = remainingFiles[0] || null;
        setActiveFile(nextFile);
        setContent(nextFile?.content || "");
      }
    } catch (error) {
      console.error(error);
    }
  };

  const previewFiles = files.map((file) =>
    file._id === activeFile?._id
      ? { ...file, content }
      : file
  );

  return (
    <div className="workspace">

      <div className="workspace-header">
        <h2>Codo-File</h2>

        <button onClick={saveFile}>
          {saving ? "Saving..." : "Save"}
        </button>
      </div>

      <div className="workspace-body">

        <Explorer
          files={files}
          activeFile={activeFile}
          onSelect={selectFile}
          onCreate={createFile}
          onDelete={deleteFile}
        />

        <div className="flex min-w-0 flex-1 flex-col">
  <div className="min-h-0 flex-1">
    {activeFile && (
      <CodeEditor
        file={{
          ...activeFile,
          content,
        }}
        onChange={setContent}
      />
    )}
  </div>

{activeFile && isPythonFile(activeFile) && (
  <div className="h-64 shrink-0">
    <PythonRunner code={content} />
  </div>
)}

{activeFile && isCFile(activeFile) && (
  <div className="h-64 shrink-0">
    <CRunner code={content} />
  </div>
)}

{isWebsiteProject(files) && (
  <div className="h-96 shrink-0">
    <WebsiteRunner key={projectId} files={previewFiles} />
  </div>
)}

</div>

        {/* <div className="editor">
          <CodeEditor
            file={{
              ...activeFile,
              content
            }}
            onChange={setContent}
          />
        </div> */}

      </div>

    </div>
  );
}