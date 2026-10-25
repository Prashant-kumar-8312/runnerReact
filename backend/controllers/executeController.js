
import axios from "axios";

const jdoodle = axios.create({
  baseURL: "https://api.jdoodle.com/v1",
  timeout: 10000,
  headers: {
    "Content-Type": "application/json",
  },
});

export const executeC = async (req, res) => {
  const { sourceCode, input = "" } = req.body ?? {};

  if (!process.env.JDOODLE_CLIENT_ID || !process.env.JDOODLE_CLIENT_SECRET) {
    return res.status(500).json({
      message: "JDoodle credentials are not configured on the server.",
    });
  }

  if (typeof sourceCode !== "string" || !sourceCode.trim()) {
    return res.status(400).json({
      message: "C source code is required.",
    });
  }

  if (sourceCode.length > 50000 || typeof input !== "string" || input.length > 10000) {
    return res.status(400).json({
      message: "Source code or input exceeds the allowed size.",
    });
  }

  try {
    const { data } = await jdoodle.post("/execute", {
      clientId: process.env.JDOODLE_CLIENT_ID,
      clientSecret: process.env.JDOODLE_CLIENT_SECRET,
      script: sourceCode,
      stdin: input,
      language: "c",
      versionIndex: "5",
    });

    return res.json({
      status: data.statusCode === 200 ? "Accepted" : "Failed",
      stdout: data.output || "",
      stderr: data.error || "",
      compile_output: data.error || "",
      message: data.cpuTime
        ? `CPU time: ${data.cpuTime}s | Memory: ${data.memory} bytes`
        : "",
      time: data.cpuTime ?? null,
      memory: data.memory ?? null,
    });
  } catch (error) {
    const status = error.response?.status;

    console.error("JDoodle request failed:", status || error.code || error.message);

    return res.status(502).json({
      message:
        status === 401
          ? "JDoodle authentication failed. Check JDOODLE_CLIENT_ID and JDOODLE_CLIENT_SECRET."
          : "Could not execute code through JDoodle. Check the server credentials and service availability.",
    });
  }
};
