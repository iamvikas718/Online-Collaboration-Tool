import React from "react";
import { useCollab } from "../context/CollabContext.jsx";

export default function UserList() {
  const { user, peers } = useCollab();

  const all = {
    [user.id]: user,
    ...peers
  };

  return (
    <div className="user-list">
      <h2>Online Users</h2>
      <ul>
        {Object.values(all).map((u) => (
          <li key={u.id}>
            <span
              className="user-color-dot"
              style={{ backgroundColor: u.color || "#e5e7eb" }}
            />
            {u.name}
            {u.id === user.id && <span className="you-label"> (you)</span>}
          </li>
        ))}
      </ul>
    </div>
  );
}
