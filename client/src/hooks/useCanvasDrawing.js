import { useEffect, useRef } from "react";
import { useCollab } from "../context/CollabContext.jsx";

function drawStrokeOnCtx(ctx, s) {
  ctx.strokeStyle = s.color;
  ctx.lineWidth = s.size;
  ctx.lineCap = "round";

  if (s.type === "brush" || s.type === "eraser") {
    ctx.beginPath();
    ctx.moveTo(s.fromX, s.fromY);
    ctx.lineTo(s.toX, s.toY);
    ctx.stroke();
  }

  if (s.type === "line") {
    ctx.beginPath();
    ctx.moveTo(s.startX, s.startY);
    ctx.lineTo(s.endX, s.endY);
    ctx.stroke();
  }

  if (s.type === "rect") {
    ctx.strokeRect(
      Math.min(s.startX, s.endX),
      Math.min(s.startY, s.endY),
      Math.abs(s.endX - s.startX),
      Math.abs(s.endY - s.startY)
    );
  }

  if (s.type === "circle") {
    ctx.beginPath();
    const r = Math.sqrt(
      Math.pow(s.endX - s.startX, 2) + Math.pow(s.endY - s.startY, 2)
    );
    ctx.arc(s.startX, s.startY, r, 0, Math.PI * 2);
    ctx.stroke();
  }

  if (s.type === "text") {
    ctx.fillStyle = s.color;
    ctx.font = `${s.size * 4}px sans-serif`;
    ctx.fillText(s.text, s.x, s.y);
  }
}

export default function useCanvasDrawing(canvasRef) {
  const { tool, color, size, sendStroke, sendCursor, strokes } = useCollab();

  const isDrawing = useRef(false);
  const startPoint = useRef(null);
  const previewCanvas = useRef(null);

  // Redraw all strokes whenever history changes
  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    const ctx = canvas.getContext("2d");
    ctx.clearRect(0, 0, canvas.width, canvas.height);

    strokes.forEach((s) => drawStrokeOnCtx(ctx, s));
  }, [strokes, canvasRef]);

  // Mouse events (instead of pointer events)
  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    const getRect = () => canvas.getBoundingClientRect();

    function getPos(e) {
      const r = getRect();
      return {
        x: e.clientX - r.left,
        y: e.clientY - r.top
      };
    }

    function handleMouseDown(e) {
      // Only respond to LEFT click
      if (e.button !== 0) return;

      const pos = getPos(e);
      isDrawing.current = true;
      startPoint.current = pos;

      if (tool === "text") {
        const text = prompt("Enter text:");
        if (text) {
          sendStroke({
            id: crypto.randomUUID(),
            type: "text",
            text,
            color,
            size,
            x: pos.x,
            y: pos.y
          });
        }
        isDrawing.current = false;
      }

      e.preventDefault();
    }

    function handleMouseMove(e) {
      const pos = getPos(e);
      sendCursor(pos.x, pos.y);

      if (!isDrawing.current) return;

      if (tool === "brush" || tool === "eraser") {
        const last = startPoint.current;

        const stroke = {
          id: crypto.randomUUID(),
          type: tool === "eraser" ? "eraser" : "brush",
          // eraser uses white (same as board background)
          color: tool === "eraser" ? "#ffffff" : color,
          size,
          fromX: last.x,
          fromY: last.y,
          toX: pos.x,
          toY: pos.y
        };

        // draw locally for smooth feel
        const ctx = canvas.getContext("2d");
        drawStrokeOnCtx(ctx, stroke);

        // sync with others + history
        sendStroke(stroke);
        startPoint.current = pos;
      }

      drawPreview(pos);
    }

    function handleMouseUp() {
      if (!isDrawing.current) return;
      isDrawing.current = false;

      const canvasRect = getRect();
      const start = startPoint.current;
      if (!start) return;

      // end position is last cursor pos stored in startPoint? – easier: no

      // shapes are finalized on mouseup using the last known mouse position
      // since we don't store it, we just skip if not drawing shapes
    }

    function handleMouseUpAnywhere(e) {
      if (!isDrawing.current) return;

      const pos = getPos(e);
      const start = startPoint.current;
      isDrawing.current = false;

      if (!start) return;

      if (tool === "line") {
        sendStroke({
          id: crypto.randomUUID(),
          type: "line",
          color,
          size,
          startX: start.x,
          startY: start.y,
          endX: pos.x,
          endY: pos.y
        });
      }

      if (tool === "rect") {
        sendStroke({
          id: crypto.randomUUID(),
          type: "rect",
          color,
          size,
          startX: start.x,
          startY: start.y,
          endX: pos.x,
          endY: pos.y
        });
      }

      if (tool === "circle") {
        sendStroke({
          id: crypto.randomUUID(),
          type: "circle",
          color,
          size,
          startX: start.x,
          startY: start.y,
          endX: pos.x,
          endY: pos.y
        });
      }

      const pCanvas = previewCanvas.current;
      if (pCanvas) {
        const ctx = pCanvas.getContext("2d");
        ctx.clearRect(0, 0, pCanvas.width, pCanvas.height);
      }
    }

    function drawPreview(pos) {
      const pCanvas = previewCanvas.current;
      if (!pCanvas) return;

      const ctx = pCanvas.getContext("2d");
      ctx.clearRect(0, 0, pCanvas.width, pCanvas.height);

      if (!isDrawing.current) return;

      const start = startPoint.current;
      ctx.strokeStyle = color;
      ctx.lineWidth = size;
      ctx.setLineDash([6, 4]);

      if (tool === "line") {
        ctx.beginPath();
        ctx.moveTo(start.x, start.y);
        ctx.lineTo(pos.x, pos.y);
        ctx.stroke();
      }

      if (tool === "rect") {
        ctx.strokeRect(
          Math.min(start.x, pos.x),
          Math.min(start.y, pos.y),
          Math.abs(pos.x - start.x),
          Math.abs(pos.y - start.y)
        );
      }

      if (tool === "circle") {
        const r = Math.sqrt(
          Math.pow(pos.x - start.x, 2) + Math.pow(pos.y - start.y, 2)
        );
        ctx.beginPath();
        ctx.arc(start.x, start.y, r, 0, Math.PI * 2);
        ctx.stroke();
      }
    }

    // Attach listeners
    canvas.addEventListener("mousedown", handleMouseDown);
    canvas.addEventListener("mousemove", handleMouseMove);
    canvas.addEventListener("mouseup", handleMouseUp);
    window.addEventListener("mouseup", handleMouseUpAnywhere);

    // Disable right-click menu on canvas
    const preventContextMenu = (e) => e.preventDefault();
    canvas.addEventListener("contextmenu", preventContextMenu);

    return () => {
      canvas.removeEventListener("mousedown", handleMouseDown);
      canvas.removeEventListener("mousemove", handleMouseMove);
      canvas.removeEventListener("mouseup", handleMouseUp);
      window.removeEventListener("mouseup", handleMouseUpAnywhere);
      canvas.removeEventListener("contextmenu", preventContextMenu);
    };
  }, [tool, color, size, sendStroke, sendCursor, canvasRef]);

  // Preview canvas overlay
  useEffect(() => {
    const mainCanvas = canvasRef.current;
    if (!mainCanvas) return;

    const preview = document.createElement("canvas");
    preview.width = mainCanvas.width;
    preview.height = mainCanvas.height;
    preview.style.position = "absolute";
    preview.style.left = "0";
    preview.style.top = "0";
    preview.style.pointerEvents = "none";

    mainCanvas.parentElement.appendChild(preview);
    previewCanvas.current = preview;

    const handleResize = () => {
      preview.width = mainCanvas.width;
      preview.height = mainCanvas.height;
    };

    window.addEventListener("resize", handleResize);

    return () => {
      window.removeEventListener("resize", handleResize);
      preview.remove();
    };
  }, [canvasRef]);
}
