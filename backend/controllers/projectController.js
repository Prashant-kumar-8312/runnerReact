import Project from "../model/Project.js";

import File from "../model/File.js";

export const createProject = async (req, res) => {
  try {
    const { name, description, language = "python" } = req.body;
    const supportedLanguages = ["javascript", "typescript", "python", "c", "html", "css", "website"];

    if (!name) {
      return res.status(400).json({
        message: "Project name is required"
      });
    }

    if (!supportedLanguages.includes(language)) {
      return res.status(400).json({
        message: "Unsupported project language"
      });
    }

    const project = await Project.create({
      ownerId: req.user._id,
      name,
      description,
      language
    });

    const starterFiles = {
      javascript: [{ name: "index.js", language: "javascript", content: `console.log("Hello Codo-File");` }],
      typescript: [{ name: "index.ts", language: "typescript", content: `const message: string = "Hello Codo-File";\nconsole.log(message);` }],
      python: [{ name: "main.py", language: "python", content: `print("Hello Codo-File")` }],
      c: [{ name: "main.c", language: "c", content: `#include <stdio.h>\n\nint main(void) {\n  printf("Hello Codo-File\\n");\n  return 0;\n}` }],
      html: [{ name: "index.html", language: "html", content: `<!DOCTYPE html>\n<html>\n  <body>\n    <h1>Hello Codo-File</h1>\n  </body>\n</html>` }],
      css: [{ name: "style.css", language: "css", content: `body {\n  font-family: Arial, sans-serif;\n}` }],
      website: [
        { name: "index.html", language: "html", content: `<!DOCTYPE html>\n<html>\n  <head>\n    <link rel="stylesheet" href="style.css" />\n  </head>\n  <body>\n    <h1>Hello Codo-File</h1>\n    <script src="script.js"></script>\n  </body>\n</html>` },
        { name: "style.css", language: "css", content: `body {\n  font-family: Arial, sans-serif;\n  margin: 2rem;\n}` },
        { name: "script.js", language: "javascript", content: `console.log("Website ready");` }
      ]
    }[language];

    await File.insertMany(
      starterFiles.map((file) => ({
        ...file,
        projectId: project._id,
        path: file.name
      }))
    );

    res.status(201).json({
      message: "Project created",
      project
    });
  } catch (error) {
    res.status(500).json({
      message: error.message
    });
  }
};


export const getProjects = async (req, res) => {
  try {
    const projects = await Project.find({
      ownerId: req.user._id
    }).sort({
      updatedAt: -1
    });

    res.json({
      projects
    });
  } catch (error) {
    res.status(500).json({
      message: error.message
    });
  }
};

export const getProject = async (req, res) => {
  try {
    const project = await Project.findOne({
      _id: req.params.id,
      ownerId: req.user._id
    });

    if (!project) {
      return res.status(404).json({
        message: "Project not found"
      });
    }

    res.json({
      project
    });
  } catch (error) {
    res.status(500).json({
      message: error.message
    });
  }
};

export const updateProject = async (req, res) => {
  try {
    const { name, description } = req.body;

    const project = await Project.findOneAndUpdate(
      {
        _id: req.params.id,
        ownerId: req.user._id
      },
      {
        name,
        description
      },
      {
        new: true
      }
    );

    if (!project) {
      return res.status(404).json({
        message: "Project not found"
      });
    }

    res.json({
      project
    });
  } catch (error) {
    res.status(500).json({
      message: error.message
    });
  }
};

export const deleteProject = async (req, res) => {
  try {
    const project = await Project.findOneAndDelete({
      _id: req.params.id,
      ownerId: req.user._id
    });

    if (!project) {
      return res.status(404).json({
        message: "Project not found"
      });
    }

    await File.deleteMany({
      projectId: project._id
    });

    res.json({
      message: "Project deleted"
    });
  } catch (error) {
    res.status(500).json({
      message: error.message
    });
  }
};
