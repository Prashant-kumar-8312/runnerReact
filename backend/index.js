// import express from "express";
// import cors from "cors";
// import dotenv from "dotenv";
// import cookieParser from "cookie-parser";

// import { connectDB } from "./config/db.js";
// import authRoutes from "./routes/authRoutes.js";

// import projectRoutes from "./routes/projectRoutes.js";

// import fileRoutes from "./routes/fileRoutes.js";

// dotenv.config();

// const app = express();

// app.use(cors());

// app.use(express.json());

// app.use(cookieParser());

// app.get("/", (req, res) => {
//   res.json({
//     message: "Codo-File API is running"
//   });
// });

// app.use("/api/auth", authRoutes);

// app.use("/api/projects", projectRoutes);

// app.use("/api/files", fileRoutes);

// const PORT = process.env.PORT || 5000;

// connectDB().then(() => {
//   app.listen(PORT, () => {
//     console.log(`Server running on port ${PORT}`);
//   });
// });


import express from "express";
import cors from "cors";
import dotenv from "dotenv";
import cookieParser from "cookie-parser";

import { connectDB } from "./config/db.js";
import authRoutes from "./routes/authRoutes.js";
import projectRoutes from "./routes/projectRoutes.js";
import fileRoutes from "./routes/fileRoutes.js";

import executeroutes from "./routes/executeroutes.js"

dotenv.config();

const app = express();

// CORS configuration — must be before API routes
const allowedOrigins = [
  "http://localhost:5173",
  "http://127.0.0.1:5173",
];

app.use(
  cors({
    origin: function (origin, callback) {
      // Allow requests without an Origin header, such as curl.
      if (!origin || allowedOrigins.includes(origin)) {
        return callback(null, true);
      }

      return callback(new Error(`Origin not allowed by CORS: ${origin}`));
    },
    credentials: true,
    methods: ["GET", "POST", "PUT", "PATCH", "DELETE", "OPTIONS"],
    allowedHeaders: ["Content-Type", "Authorization"],
  })
);

app.use(express.json());
app.use(cookieParser());

app.get("/", (req, res) => {
  res.json({ message: "Codo-File API is running" });
});

app.use("/api/auth", authRoutes);
app.use("/api/projects", projectRoutes);
app.use("/api/files", fileRoutes);
app.use("/api/execute", executeroutes); // Add this line to handle C code execution

const PORT = process.env.PORT || 5000;

connectDB()
  .then(() => {
    app.listen(PORT, () => {
      console.log(`Server running on port ${PORT}`);
    });
  })
  .catch((error) => {
    console.error("Database connection failed:", error);
  });
