import { useEffect, useState } from "react";
import { useAppDispatch, useAppSelector } from "../store/hooks";
import { logout, selectToken } from "../features/auth/authSlice";
import { listSeforimApi, type Sefer } from "../api/seforim";

export default function LibraryPage() {
  const dispatch = useAppDispatch();
  const token = useAppSelector(selectToken);
  const [items, setItems] = useState<Sefer[]>([]);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (!token) return;

    listSeforimApi(token)
      .then((res) => setItems(res.seforim))
      .catch((e) => setError(e?.message ?? "Failed to load"));
  }, [token]);

  return (
    <div style={{ padding: 24, fontFamily: "system-ui", maxWidth: 760 }}>
      <div
        style={{
          display: "flex",
          justifyContent: "space-between",
          alignItems: "center",
        }}
      >
        <h1>My Library</h1>
        <button onClick={() => dispatch(logout())}>Logout</button>
      </div>

      {error && <p style={{ color: "crimson" }}>{error}</p>}

      {items.length === 0 && !error ? (
        <p>No seforim yet.</p>
      ) : (
        <ul>
          {items.map((s) => (
            <li
              key={s.id}
              style={{ padding: "10px 0", borderBottom: "1px solid #ddd" }}
            >
              <div style={{ fontWeight: 600 }}>
                {s.title} {s.title_he ? ` / ${s.title_he}` : ""}
              </div>
              <div style={{ opacity: 0.8 }}>
                {s.author ?? "Unknown author"}
                {s.author_he ? ` / ${s.author_he}` : ""} • {s.genre ?? "—"}
              </div>
            </li>
          ))}
        </ul>
      )}
    </div>
  );
}
