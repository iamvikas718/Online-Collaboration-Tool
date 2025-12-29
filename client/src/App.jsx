import React from "react";
import { CollabProvider } from "./context/CollabContext.jsx";

import Toolbar from "./components/Toolbar.jsx";
import CanvasBoard from "./components/CanvasBoard.jsx";
import UserList from "./components/UserList.jsx";
import StatusBar from "./components/StatusBar.jsx";

export default function App() {
  return (
    <CollabProvider>
      <div className="app-root">
        <header className="app-header">
          <h1>Real-time Collaboration Tool</h1>
        </header>

        <StatusBar />

        <div className="toolbar-wrapper">
          <Toolbar />
        </div>

        <main className="app-main">
          <section className="canvas-section">
            <CanvasBoard />
          </section>

          <aside className="sidebar">
            <UserList />
          </aside>
        </main>
      </div>
    </CollabProvider>
  );
}
