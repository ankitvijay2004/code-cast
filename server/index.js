const express = require("express");
const app = express();
const http = require("http");
const { Server } = require("socket.io");
const ACTIONS = require("./Actions");
const cors = require("cors");
const axios = require("axios");
const fs = require("fs/promises");
const os = require("os");
const path = require("path");
const { execFile } = require("child_process");
const server = http.createServer(app);
require("dotenv").config();

const languageConfig = {
  python3: { versionIndex: "3" },
  java: { versionIndex: "3" },
  cpp: { versionIndex: "4" },
  nodejs: { versionIndex: "3" },
  c: { versionIndex: "4" },
  ruby: { versionIndex: "3" },
  go: { versionIndex: "3" },
  scala: { versionIndex: "3" },
  bash: { versionIndex: "3" },
  sql: { versionIndex: "3" },
  pascal: { versionIndex: "2" },
  csharp: { versionIndex: "3" },
  php: { versionIndex: "3" },
  swift: { versionIndex: "3" },
  rust: { versionIndex: "3" },
  r: { versionIndex: "3" },
};

const useJdoodle =
  Boolean(process.env.jDoodle_clientId) && Boolean(process.env.kDoodle_clientSecret);

function executeCandidate(command, args, timeout = 10000) {
  return new Promise((resolve, reject) => {
    execFile(command, args, { timeout }, (error, stdout, stderr) => {
      if (!error) {
        resolve({ output: `${stdout || ""}${stderr || ""}`.trim() });
        return;
      }

      if (error.code === "ENOENT") {
        reject(new Error("COMMAND_NOT_FOUND"));
        return;
      }

      resolve({ output: `${stdout || ""}${stderr || ""}`.trim() || String(error.message) });
    });
  });
}

async function runLocally(code, language) {
  const tempDir = await fs.mkdtemp(path.join(os.tmpdir(), "codecast-"));
  try {
    if (language === "python3") {
      const filePath = path.join(tempDir, "main.py");
      await fs.writeFile(filePath, code || "", "utf8");
      const candidates = [
        { command: "python", args: [filePath] },
        { command: "py", args: ["-3", filePath] },
      ];

      for (const item of candidates) {
        try {
          return await executeCandidate(item.command, item.args);
        } catch (err) {
          if (err.message !== "COMMAND_NOT_FOUND") {
            throw err;
          }
        }
      }
      return { output: "Python is not installed or not available in PATH on this machine." };
    }

    if (language === "nodejs") {
      const filePath = path.join(tempDir, "main.js");
      await fs.writeFile(filePath, code || "", "utf8");
      return await executeCandidate("node", [filePath]);
    }

    if (language === "bash") {
      const filePath = path.join(tempDir, "main.sh");
      await fs.writeFile(filePath, code || "", "utf8");
      try {
        return await executeCandidate("bash", [filePath]);
      } catch (err) {
        if (err.message === "COMMAND_NOT_FOUND") {
          return { output: "Bash is not installed or not available in PATH on this machine." };
        }
        throw err;
      }
    }

    return {
      output:
        "Local runner supports python3, nodejs, and bash right now. Add JDoodle credentials to enable all languages.",
    };
  } finally {
    await fs.rm(tempDir, { recursive: true, force: true });
  }
}

// Enable CORS
app.use(cors());

// Parse JSON bodies
app.use(express.json());

app.get("/", (req, res) => {
  res.json({ status: "ok", message: "CodeCast API is running" });
});

app.get("/health", (req, res) => {
  res.json({ status: "healthy" });
});

const io = new Server(server, {
  cors: {
    origin: "http://localhost:3000",
    methods: ["GET", "POST"],
  },
});

const userSocketMap = {};
const getAllConnectedClients = (roomId) => {
  return Array.from(io.sockets.adapter.rooms.get(roomId) || []).map(
    (socketId) => {
      return {
        socketId,
        username: userSocketMap[socketId],
      };
    }
  );
};

io.on("connection", (socket) => {
  // console.log('Socket connected', socket.id);
  socket.on(ACTIONS.JOIN, ({ roomId, username }) => {
    userSocketMap[socket.id] = username;
    socket.join(roomId);
    const clients = getAllConnectedClients(roomId);
    // notify that new user join
    clients.forEach(({ socketId }) => {
      io.to(socketId).emit(ACTIONS.JOINED, {
        clients,
        username,
        socketId: socket.id,
      });
    });
  });

  // sync the code
  socket.on(ACTIONS.CODE_CHANGE, ({ roomId, code }) => {
    socket.in(roomId).emit(ACTIONS.CODE_CHANGE, { code });
  });
  // when new user join the room all the code which are there are also shows on that persons editor
  socket.on(ACTIONS.SYNC_CODE, ({ socketId, code }) => {
    io.to(socketId).emit(ACTIONS.CODE_CHANGE, { code });
  });

  // leave room
  socket.on("disconnecting", () => {
    const rooms = [...socket.rooms];
    // leave all the room
    rooms.forEach((roomId) => {
      socket.in(roomId).emit(ACTIONS.DISCONNECTED, {
        socketId: socket.id,
        username: userSocketMap[socket.id],
      });
    });

    delete userSocketMap[socket.id];
    socket.leave();
  });
});

app.post("/compile", async (req, res) => {
  const { code, language } = req.body;

  if (!languageConfig[language]) {
    return res.status(400).json({ error: "Unsupported language" });
  }

  try {
    if (useJdoodle) {
      const response = await axios.post("https://api.jdoodle.com/v1/execute", {
        script: code,
        language,
        versionIndex: languageConfig[language].versionIndex,
        clientId: process.env.jDoodle_clientId,
        clientSecret: process.env.kDoodle_clientSecret,
      });
      return res.json({ output: response.data?.output || "Program executed with no output" });
    }

    const localResult = await runLocally(code, language);
    return res.json({ output: localResult.output || "Program executed with no output" });
  } catch (error) {
    const details =
      error.response?.data?.message ||
      error.response?.data?.error ||
      "Compile service request failed";
    console.error("Compile error:", details);
    res.status(500).json({ error: `Failed to compile code: ${details}` });
  }
});

const PORT = process.env.PORT || 5000;
server.listen(PORT, () => console.log(`Server is running on port ${PORT}`));
