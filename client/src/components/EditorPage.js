import React, { useCallback, useEffect, useRef, useState } from "react";
import Client from "./Client";
import Editor from "./Editor";
import { initSocket } from "../Socket";
import { ACTIONS } from "../Actions";
import {
  useNavigate,
  useLocation,
  Navigate,
  useParams,
} from "react-router-dom";
import { toast } from "react-hot-toast";
import axios from "axios";

// List of supported languages
const LANGUAGES = [
  "python3",
  "java",
  "cpp",
  "nodejs",
  "c",
  "ruby",
  "go",
  "scala",
  "bash",
  "sql",
  "pascal",
  "csharp",
  "php",
  "swift",
  "rust",
  "r",
];

function EditorPage() {
  const [clients, setClients] = useState([]);
  const [output, setOutput] = useState("");
  const [isCompileWindowOpen, setIsCompileWindowOpen] = useState(false);
  const [isCompiling, setIsCompiling] = useState(false);
  const [selectedLanguage, setSelectedLanguage] = useState("python3");
  const [lastEditAt, setLastEditAt] = useState(Date.now());
  const codeRef = useRef(null);

  const Location = useLocation();
  const navigate = useNavigate();
  const { roomId } = useParams();
  const username = Location.state?.username;

  const socketRef = useRef(null);
  const backendUrl = process.env.REACT_APP_BACKEND_URL || "http://localhost:5000";

  useEffect(() => {
    let socket;

    const init = async () => {
      socket = await initSocket();
      socketRef.current = socket;

      const handleErrors = (err) => {
        console.log("Error", err);
        toast.error("Socket connection failed, Try again later");
        navigate("/");
      };

      socket.on("connect_error", (err) => handleErrors(err));
      socket.on("connect_failed", (err) => handleErrors(err));

      socket.emit(ACTIONS.JOIN, {
        roomId,
        username,
      });

      socket.on(
        ACTIONS.JOINED,
        ({ clients, username: joinedUserName, socketId }) => {
          if (joinedUserName !== username) {
            toast.success(`${joinedUserName} joined the room.`);
          }
          setClients(clients);
          socket.emit(ACTIONS.SYNC_CODE, {
            code: codeRef.current,
            socketId,
          });
        }
      );

      socket.on(ACTIONS.DISCONNECTED, ({ socketId, username: leftUserName }) => {
        toast.success(`${leftUserName} left the room`);
        setClients((prev) => {
          return prev.filter((client) => client.socketId !== socketId);
        });
      });
    };
    init();

    return () => {
      if (socket) {
        socket.off(ACTIONS.JOINED);
        socket.off(ACTIONS.DISCONNECTED);
        socket.disconnect();
      }
    };
  }, [navigate, roomId, username]);

  const copyRoomId = async () => {
    try {
      await navigator.clipboard.writeText(roomId);
      toast.success(`Room ID is copied`);
    } catch (error) {
      console.log(error);
      toast.error("Unable to copy the room ID");
    }
  };

  const leaveRoom = async () => {
    navigate("/");
  };

  const runCode = async () => {
    setIsCompiling(true);
    try {
      const response = await axios.post(`${backendUrl}/compile`, {
        code: codeRef.current,
        language: selectedLanguage,
      });
      console.log("Backend response:", response.data);
      setOutput(response.data.output || JSON.stringify(response.data));
    } catch (error) {
      console.error("Error compiling code:", error);
      setOutput(error.response?.data?.error || "An error occurred");
    } finally {
      setIsCompiling(false);
    }
  };

  const toggleCompileWindow = () => {
    setIsCompileWindowOpen(!isCompileWindowOpen);
  };

  const handleCodeChange = useCallback((code) => {
    codeRef.current = code;
    setLastEditAt(Date.now());
  }, []);

  const getActivityLabel = () => {
    const diff = Date.now() - lastEditAt;
    if (diff < 2000) return "Live typing";
    if (diff < 10000) return "Syncing recent changes";
    return "Idle, ready for the next edit";
  };

  if (!Location.state) {
    return <Navigate to="/" />;
  }

  return (
    <div className="editor-shell page-bg">
      <div className="editor-topbar glass-panel">
        <div className="topbar-left">
          <span className="eyebrow">Room session</span>
          <h2 className="topbar-title mb-0">Collaborative editor workspace</h2>
        </div>

        <div className="topbar-metrics">
          <div className="metric-chip">
            <span className="metric-label">Room</span>
            <strong>{roomId.slice(0, 8)}…</strong>
          </div>
          <div className="metric-chip">
            <span className="metric-label">Members</span>
            <strong>{clients.length}</strong>
          </div>
          <div className="metric-chip metric-live">
            <span className="metric-dot" />
            <strong>{getActivityLabel()}</strong>
          </div>
        </div>
      </div>

      <div className="editor-layout">
        <aside className="sidebar-panel glass-panel text-light">
          <div className="sidebar-brand text-center mb-4">
            <img
              src="/images/codecast.png"
              alt="Logo"
              className="img-fluid mx-auto logo-mark sidebar-logo"
            />
            <div className="room-badge mt-3">Room {roomId.slice(0, 8)}…</div>
            <p className="text-muted small mt-2 mb-0">Shared workspace members</p>
          </div>

          <div className="sidebar-summary mb-3">
            <div>
              <span className="summary-label">Session status</span>
              <strong>Ready to collaborate</strong>
            </div>
            <span className="summary-badge">{clients.length} online</span>
          </div>

          <div className="members-list flex-grow-1">
            {clients.map((client) => (
              <Client key={client.socketId} username={client.username} />
            ))}
          </div>

          <div className="sidebar-actions mt-4">
            <button className="btn btn-outline-light w-100 mb-2 action-btn" onClick={copyRoomId}>
              Copy Room ID
            </button>
            <button className="btn btn-danger w-100 action-btn" onClick={leaveRoom}>
              Leave Room
            </button>
          </div>
        </aside>

        <main className="editor-panel glass-panel text-light">
          <div className="editor-toolbar">
            <div>
              <div className="eyebrow mb-1">Live collaborative editor</div>
              <h2 className="h5 mb-0">Build in sync with your team</h2>
            </div>
            <div className="d-flex align-items-center gap-3 flex-wrap justify-content-end">
              <span className="status-pill status-live">
                <span className="status-dot" /> Auto-sync enabled
              </span>
              <select
                className="form-select form-select-sm language-select"
                value={selectedLanguage}
                onChange={(e) => setSelectedLanguage(e.target.value)}
              >
                {LANGUAGES.map((lang) => (
                  <option key={lang} value={lang}>
                    {lang}
                  </option>
                ))}
              </select>
            </div>
          </div>

          <Editor
            socketRef={socketRef}
            roomId={roomId}
            onCodeChange={handleCodeChange}
          />
        </main>
      </div>

      <button
        className="btn btn-primary floating-compiler-toggle"
        onClick={toggleCompileWindow}
      >
        {isCompileWindowOpen ? "Hide compiler" : "Open compiler"}
      </button>

      <div className={`compiler-drawer ${isCompileWindowOpen ? "open" : ""}`}>
        <div className="compiler-head d-flex justify-content-between align-items-center mb-3 gap-3 flex-wrap">
          <div>
            <span className="eyebrow mb-2">Compiler panel</span>
            <h5 className="m-0 mt-2">Preview your output</h5>
            <small className="text-muted">Language: {selectedLanguage}</small>
          </div>
          <div className="d-flex gap-2 flex-wrap align-items-center">
            <button
              className="btn btn-outline-light"
              onClick={() => setOutput("")}
              disabled={isCompiling}
            >
              Clear
            </button>
            <button
              className="btn btn-success"
              onClick={runCode}
              disabled={isCompiling}
            >
              {isCompiling ? "Compiling..." : "Run Code"}
            </button>
            <button className="btn btn-outline-light" onClick={toggleCompileWindow}>
              Close
            </button>
          </div>
        </div>

        <div className="output-console-wrap">
          <div className="output-console-header">
            <span className="output-tag">Console</span>
            <span className="output-tag output-tag-soft">Ready</span>
          </div>
          <pre className="output-console mb-0">
            {output || "Output will appear here after compilation"}
          </pre>
        </div>
      </div>
    </div>
  );
}

export default EditorPage;
