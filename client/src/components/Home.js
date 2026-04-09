import React, { useState } from "react";
import { v4 as uuid } from "uuid";
import toast from "react-hot-toast";
import { useNavigate } from "react-router-dom";

function Home({ theme, onToggleTheme }) {
  const [roomId, setRoomId] = useState("");
  const [username, setUsername] = useState("");

  const navigate = useNavigate();

  const generateRoomId = (e) => {
    e.preventDefault();
    const Id = uuid();
    setRoomId(Id);
    toast.success("Room Id is generated");
  };

  const joinRoom = () => {
    if (!roomId || !username) {
      toast.error("Both the field is requried");
      return;
    }

    // redirect
    navigate(`/editor/${roomId}`, {
      state: {
        username,
      },
    });
    toast.success("room is created");
  };

  // when enter then also join
  const handleInputEnter = (e) => {
    if (e.code === "Enter") {
      joinRoom();
    }
  };

  return (
    <div className="page-bg home-page">
      <div className="floating-orb orb-1" />
      <div className="floating-orb orb-2" />

      <div className="theme-toggle-wrap">
        <button className="theme-toggle-btn" onClick={onToggleTheme}>
          <span className="theme-toggle-label">{theme === "dark" ? "Light mode" : "Dark mode"}</span>
          <span className="theme-toggle-icon">{theme === "dark" ? "☀" : "☾"}</span>
        </button>
      </div>

      <div className="container-fluid px-3 px-lg-5 py-4 min-vh-100 d-flex align-items-center">
        <div className="row align-items-center justify-content-between g-4 w-100 hero-layout">
          <div className="col-12 col-lg-7 hero-copy text-light">
            <span className="eyebrow">Live coding • portfolio showcase</span>
            <h1 className="hero-title mt-4 mb-3">
              Build together in a clean, modern coding room.
            </h1>
            <p className="hero-text lead mb-4">
              CodeCast is designed like a polished product demo: smooth collaboration, a focused editor,
              and a room-based experience that feels easy to present.
            </p>

            <div className="feature-grid mb-4">
              <div className="feature-card">
                <strong>Realtime sync</strong>
                <span>Changes flow instantly to every connected user.</span>
              </div>
              <div className="feature-card">
                <strong>Room sharing</strong>
                <span>Generate a room ID and invite collaborators fast.</span>
              </div>
              <div className="feature-card">
                <strong>Portfolio ready</strong>
                <span>Dark glass UI with a cleaner, premium visual rhythm.</span>
              </div>
            </div>

            <div className="stats-row">
              <div className="stat-pill">
                <span className="stat-number">01</span>
                <span>Create a room</span>
              </div>
              <div className="stat-pill">
                <span className="stat-number">02</span>
                <span>Join with a name</span>
              </div>
              <div className="stat-pill">
                <span className="stat-number">03</span>
                <span>Code live together</span>
              </div>
            </div>
          </div>

          <div className="col-12 col-lg-4">
            <div className="auth-card glass-panel">
              <div className="text-center mb-4">
                <img
                  src="/images/codecast.png"
                  alt="CodeCast Logo"
                  className="img-fluid mx-auto d-block logo-mark"
                />
                <h2 className="h3 fw-semibold mt-3 mb-1 text-white">Enter a room</h2>
                <p className="text-muted mb-0">
                  Join an active session or create a new room in seconds.
                </p>
              </div>

              <div className="mb-3">
                <label className="form-label text-light small mb-2">Room ID</label>
                <input
                  type="text"
                  value={roomId}
                  onChange={(e) => setRoomId(e.target.value)}
                  className="form-control form-control-lg input-glow"
                  placeholder="Paste a room ID"
                  onKeyUp={handleInputEnter}
                />
              </div>

              <div className="mb-4">
                <label className="form-label text-light small mb-2">Your name</label>
                <input
                  type="text"
                  value={username}
                  onChange={(e) => setUsername(e.target.value)}
                  className="form-control form-control-lg input-glow"
                  placeholder="Display name"
                  onKeyUp={handleInputEnter}
                />
              </div>

              <div className="d-grid gap-3">
                <button onClick={joinRoom} className="btn btn-primary btn-lg action-btn">
                  Join room
                </button>
                <button
                  onClick={generateRoomId}
                  className="btn btn-outline-light btn-lg action-btn secondary-btn"
                >
                  Generate room ID
                </button>
              </div>

              <div className="form-note mt-4 text-center small text-muted">
                Press Enter after typing to join faster.
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

export default Home;
