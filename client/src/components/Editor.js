import React, { useEffect, useRef } from "react";
import "codemirror/mode/javascript/javascript";
import "codemirror/theme/dracula.css";
import "codemirror/addon/edit/closetag";
import "codemirror/addon/edit/closebrackets";
import "codemirror/lib/codemirror.css";
import CodeMirror from "codemirror";
import { ACTIONS } from "../Actions";

function Editor({ socketRef, roomId, onCodeChange }) {
  const editorRef = useRef(null);

  useEffect(() => {
    if (editorRef.current) {
      return;
    }

    const editor = CodeMirror.fromTextArea(
      document.getElementById("realtimeEditor"),
      {
        mode: { name: "javascript", json: true },
        theme: "dracula",
        autoCloseTags: true,
        autoCloseBrackets: true,
        lineNumbers: true,
      }
    );

    editorRef.current = editor;
    editor.setSize("100%", "100%");

    const handleLocalCodeChange = (instance, changes) => {
      const { origin } = changes;
      const code = instance.getValue();
      onCodeChange(code);

      if (origin !== "setValue" && socketRef.current) {
        socketRef.current.emit(ACTIONS.CODE_CHANGE, {
          roomId,
          code,
        });
      }
    };

    editor.on("change", handleLocalCodeChange);

    return () => {
      editor.off("change", handleLocalCodeChange);
    };
  }, [onCodeChange, roomId, socketRef]);

  // data receive from server
  useEffect(() => {
    const socket = socketRef.current;
    if (!socket || !editorRef.current) {
      return;
    }

    const handleRemoteCodeChange = ({ code }) => {
      if (code !== null && editorRef.current) {
        editorRef.current.setValue(code);
      }
    };

    socket.on(ACTIONS.CODE_CHANGE, handleRemoteCodeChange);

    return () => {
      socket.off(ACTIONS.CODE_CHANGE, handleRemoteCodeChange);
    };
  }, [socketRef]);

  return (
    <div className="editor-wrapper">
      <textarea id="realtimeEditor"></textarea>
    </div>
  );
}

export default Editor;
