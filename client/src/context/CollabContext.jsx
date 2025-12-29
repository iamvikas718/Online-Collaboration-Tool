import React, {
  createContext,
  useContext,
  useEffect,
  useRef,
  useState,
  useCallback
} from "react";

const CollabContext = createContext(null);

function randomColor() {
  const colors = ["#e11d48", "#0ea5e9", "#22c55e", "#a855f7", "#f97316"];
  return colors[Math.floor(Math.random() * colors.length)];
}

function randomName() {
  const id = Math.floor(Math.random() * 9000) + 1000;
  return `User-${id}`;
}

export const CollabProvider = ({ children }) => {
  const [isConnected, setIsConnected] = useState(false);
  const [strokes, setStrokes] = useState([]);

  const undoStack = useRef([]);
  const redoStack = useRef([]);

  const [peers, setPeers] = useState({});

  const [tool, setTool] = useState("brush");
  const [color, setColor] = useState(randomColor());
  const [size, setSize] = useState(3);

  const socketRef = useRef(null);

  const userRef = useRef({
    id: crypto.randomUUID(),
    name: randomName(),
    color: color
  });

  useEffect(() => {
    const socket = new WebSocket(
      import.meta.env.VITE_WS_URL || "ws://localhost:4000"
    );
    socketRef.current = socket;

    socket.onopen = () => {
      setIsConnected(true);
      socket.send(JSON.stringify({ type: "join", payload: userRef.current }));
    };

    socket.onclose = () => setIsConnected(false);

    socket.onmessage = (event) => {
      let msg;
      try {
        msg = JSON.parse(event.data);
      } catch {
        return;
      }

      switch (msg.type) {
        case "stroke":
          setStrokes((prev) => [...prev, msg.payload]);
          break;
        case "cursor":
          setPeers((prev) => ({
            ...prev,
            [msg.payload.id]: msg.payload
          }));
          break;
        case "join":
          setPeers((prev) => ({
            ...prev,
            [msg.payload.id]: msg.payload
          }));
          break;
        case "undo":
        case "redo":
          setStrokes(msg.payload.strokes);
          break;
        default:
          break;
      }
    };
  }, []);

  const sendStroke = useCallback((stroke) => {
    undoStack.current.push(stroke);

    const socket = socketRef.current;
    if (socket?.readyState === WebSocket.OPEN) {
      socket.send(JSON.stringify({ type: "stroke", payload: stroke }));
    }

    setStrokes((prev) => [...prev, stroke]);
  }, []);

  const sendCursor = useCallback((x, y) => {
    const socket = socketRef.current;

    const payload = { ...userRef.current, x, y };

    setPeers((prev) => ({
      ...prev,
      [payload.id]: payload
    }));

    if (socket?.readyState === WebSocket.OPEN) {
      socket.send(JSON.stringify({ type: "cursor", payload }));
    }
  }, []);

  const undo = useCallback(() => {
    if (undoStack.current.length === 0) return;

    const removed = undoStack.current.pop();
    redoStack.current.push(removed);

    const newStrokes = undoStack.current.map((s) => ({ ...s }));
    setStrokes(newStrokes);

    socketRef.current?.send?.(
      JSON.stringify({ type: "undo", payload: { strokes: newStrokes } })
    );
  }, []);

  const redo = useCallback(() => {
    if (redoStack.current.length === 0) return;

    const restored = redoStack.current.pop();
    undoStack.current.push(restored);

    const newStrokes = undoStack.current.map((s) => ({ ...s }));
    setStrokes(newStrokes);

    socketRef.current?.send?.(
      JSON.stringify({ type: "redo", payload: { strokes: newStrokes } })
    );
  }, []);

  const exportPNG = () => {
    const canvas = document.getElementById("main-canvas");
    if (!canvas) return;
    const link = document.createElement("a");
    link.download = "whiteboard.png";
    link.href = canvas.toDataURL("image/png");
    link.click();
  };

  return (
    <CollabContext.Provider
      value={{
        user: userRef.current,
        isConnected,
        strokes,
        peers,
        tool,
        setTool,
        color,
        setColor,
        size,
        setSize,
        sendStroke,
        sendCursor,
        undo,
        redo,
        exportPNG
      }}
    >
      {children}
    </CollabContext.Provider>
  );
};

export const useCollab = () => {
  const ctx = useContext(CollabContext);
  if (!ctx) throw new Error("useCollab must be inside provider");
  return ctx;
};
