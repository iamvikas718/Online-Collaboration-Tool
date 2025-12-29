import React, { useEffect, useRef } from "react";
import { useCollab } from "../context/CollabContext.jsx";
import useCanvasDrawing from "../hooks/useCanvasDrawing.js";

export default function CanvasBoard() {
  const canvasRef = useRef(null);
  const { peers } = useCollab();

  useCanvasDrawing(canvasRef);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    const resize = () => {
      const parent = canvas.parentElement;
      if (!parent) return;
      canvas.width = parent.clientWidth;
      canvas.height = parent.clientHeight;
    };

    resize();
    window.addEventListener("resize", resize);
    return () => window.removeEventListener("resize", resize);
  }, []);

  return (
    <div className="canvas-wrapper">
      <canvas ref={canvasRef} id="main-canvas" className="board-canvas" />

      {Object.values(peers).map((p) =>
        p.x != null && p.y != null ? (
          <div
            key={p.id}
            className="cursor"
            style={{
              left: p.x,
              top: p.y,
              borderColor: p.color || "#e5e7eb"
            }}
          >
            <span style={{ backgroundColor: p.color || "#e5e7eb" }}>
              {p.name}
            </span>
          </div>
        ) : null
      )}
    </div>
  );
}
