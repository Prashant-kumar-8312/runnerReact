

import File from "../model/File.js";
import Project from "../model/Project.js";



export const getFiles = async (req, res) => {
  try {
    const project = await Project.findOne({
      _id: req.params.projectId,
      ownerId: req.user._id
    });

    if (!project) {
      return res.status(404).json({
        message: "Project not found"
      });
    }

    const files = await File.find({
      projectId: project._id
    }).sort({
      name: 1
    });

    res.json({
      files
    });
  } catch (error) {
    res.status(500).json({
      message: error.message
    });
  }
};


export const createFile = async (req, res) => {
  try {
    const { name, path, language, content } = req.body;

    const project = await Project.findOne({
      _id: req.params.projectId,
      ownerId: req.user._id
    });

    if (!project) {
      return res.status(404).json({
        message: "Project not found"
      });
    }

    const file = await File.create({
      projectId: project._id,
      name,
      path,
      language,
      content: content || ""
    });

    res.status(201).json({
      file
    });
  } catch (error) {
    res.status(500).json({
      message: error.message
    });
  }
};

export const updateFile = async (req, res) => {
  try {
    const { content } = req.body;

    const file = await File.findById(req.params.id);

    if (!file) {
      return res.status(404).json({
        message: "File not found"
      });
    }

    const project = await Project.findOne({
      _id: file.projectId,
      ownerId: req.user._id
    });

    if (!project) {
      return res.status(403).json({
        message: "Access denied"
      });
    }

    file.content = content;

    await file.save();

    res.json({
      message: "File saved",
      file
    });
  } catch (error) {
    res.status(500).json({
      message: error.message
    });
  }
};

export const deleteFile = async (req, res) => {
  try {
    const file = await File.findById(req.params.id);

    if (!file) {
      return res.status(404).json({
        message: "File not found"
      });
    }

    const project = await Project.findOne({
      _id: file.projectId,
      ownerId: req.user._id
    });

    if (!project) {
      return res.status(403).json({
        message: "Access denied"
      });
    }

    await file.deleteOne();

    res.json({
      message: "File deleted"
    });
  } catch (error) {
    res.status(500).json({
      message: error.message
    });
  }
};