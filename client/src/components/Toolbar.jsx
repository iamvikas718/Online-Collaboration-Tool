import React from "react";
import { useCollab } from "../context/CollabContext.jsx";

export default function Toolbar() {
  const {
    tool,
    setTool,
    color,
    setColor,
    size,
    setSize,
    undo,
    redo,
    exportPNG
  } = useCollab();

  const toolBtn = (id, label) => (
    <button
      type="button"
      className={`tool-btn ${tool === id ? "active" : ""}`}
      onClick={() => setTool(id)}
    >
      {label}
    </button>
  );

  return (
    <div className="toolbar">
      {toolBtn("brush", "Brush")}
      {toolBtn("eraser", "Eraser")}
      {toolBtn("line", "Line")}
      {toolBtn("rect", "Rect")}
      {toolBtn("circle", "Circle")}
      {toolBtn("text", "Text")}

      <input
        type="color"
        className="color-picker"
        value={color}
        onChange={(e) => setColor(e.target.value)}
        title="Brush Color"
      />

      <input
        type="range"
        min="1"
        max="20"
        value={size}
        className="size-slider"
        onChange={(e) => setSize(Number(e.target.value))}
        title="Brush Size"
      />

      <button type="button" className="tool-btn" onClick={undo}>
        ⬅ Undo
      </button>
      <button type="button" className="tool-btn" onClick={redo}>
        Redo ➡
      </button>

      <button
        type="button"
        className="tool-btn"
        onClick={exportPNG}
        title="Export canvas as PNG"
      >
        ⬇ Export PNG
      </button>
    </div>
  );
}
