import mongoose from "mongoose";

const projectSchema = new mongoose.Schema(
  {
    ownerId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true
    },

    name: {
      type: String,
      required: true
    },

    language: {
      type: String,
      enum: ["javascript", "typescript", "python", "c", "html", "css", "website"],
      default: "python"
    },

    description: String
  },
  {
    timestamps: true
  }
);

export default mongoose.model("Project", projectSchema);