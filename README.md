# CodeCast

CodeCast is a real-time collaborative coding app built with React, Node.js, Express, and Socket.IO. Multiple users can join the same room, edit code together, and run code from a built-in compiler panel.

## Highlights

- Real-time collaborative editing
- Room-based sharing with generated room IDs
- Username-based participant list
- Built-in compiler output panel
- Modern glassmorphism UI with dark/light theme support
- Responsive layout for desktop and mobile

## Tech Stack

- React
- Node.js
- Express
- Socket.IO
- CodeMirror
- Axios
- Bootstrap

## Local Setup

The project is split into two apps:

- Client: client
- Server: server

### 1) Install dependencies

Install packages in both folders:

- client
- server

### 2) Configure the client backend URL

If needed, set REACT_APP_BACKEND_URL to http://localhost:5000.

### 3) Start the server

Run the Node server from the server folder.

### 4) Start the client

Run the React app from the client folder.

## How to use

1. Open the app in your browser.
2. Enter your name.
3. Paste or generate a room ID.
4. Join the room and start coding.
5. Use the compiler panel to run code.

## API

- GET / — health/status response
- GET /health — health check
- POST /compile — sends code to the compiler service

## Notes

- The compiler uses the backend server.
- The app is optimized for room-based collaboration rather than one-off solo editing.
- If the compiler does not work, check your environment variables for the external compiler service credentials.
