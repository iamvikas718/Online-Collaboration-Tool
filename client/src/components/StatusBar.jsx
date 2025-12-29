import React from "react";
import { useCollab } from "../context/CollabContext.jsx";

export default function StatusBar() {
  const { user, isConnected, tool } = useCollab();

  const toolLabelMap = {
    brush: "Brush",
    eraser: "Eraser",
    line: "Line",
    rect: "Rectangle",
    circle: "Circle",
    text: "Text"
  };

  return (
    <div className="status-bar">
      <div>
        Logged in as <strong>{user.name}</strong>
      </div>
      <div>Tool: {toolLabelMap[tool] || tool}</div>
      <div>
        Status:{" "}
        <span className={isConnected ? "status-online" : "status-offline"}>
          {isConnected ? "Connected" : "Disconnected"}
        </span>
      </div>
    </div>
  );
}
