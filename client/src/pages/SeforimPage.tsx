import { useEffect, useState } from "react";
import { useNavigate, Link } from "react-router-dom";
import { useAppDispatch, useAppSelector } from "../store/hooks";
import { selectToken } from "../features/auth/authSlice";
import { listSeforimApi, type Sefer, deleteSeferApi } from "../api/seforim";
import { addToLibraryApi } from "../api/library";

export default function SeforimPage() {
  const dispatch = useAppDispatch(); // may not use yet, but fine
  const token = useAppSelector(selectToken);
  const navigate = useNavigate();

  const [seforim, setSeforim] = useState<Sefer[]>([]);
  const [error, setError] = useState<string | null>(null);
  const [addingId, setAddingId] = useState<string | null>(null);
  const [deletingId, setDeletingId] = useState<string | null>(null);

  useEffect(() => {
    if (!token) return;

    listSeforimApi(token)
      .then((res) => setSeforim(res.seforim))
      .catch((e) => setError(e?.message ?? "Failed to load seforim"));
  }, [token]);

  async function handleAdd(seferId: string) {
    if (!token) return;

    setError(null);
    setAddingId(seferId);

    try {
      await addToLibraryApi(token, { seferId });
      // after adding, go to library ("/") to see it
      navigate("/");
    } catch (e: any) {
      setError(e?.message ?? "Failed to add to library");
    } finally {
      setAddingId(null);
    }
  }

  async function handleDelete(seferId: string) {
    if (!token) return;
    const ok = confirm("Delete this sefer from the database?");
    if (!ok) return;

    setDeletingId(seferId);
    setError(null);

    try {
      await deleteSeferApi(token, seferId);
      // remove from UI (simple refetch or local filter)
      setSeforim((prev) => prev.filter((s) => s.id !== seferId));
    } catch (e: any) {
      setError(e?.message ?? "Failed to delete sefer");
    } finally {
      setDeletingId(null);
    }
  }

  return (
    <div style={{ padding: 24, fontFamily: "system-ui", maxWidth: 900 }}>
      <h1>Seforim</h1>

      <p>
        <Link to="/">← Back to My Library</Link>
      </p>

      <p>
        <Link to="/seforim/new">+ Add a sefer</Link>
      </p>

      {error && <p style={{ color: "crimson" }}>{error}</p>}

      {seforim.length === 0 && !error ? (
        <p>No seforim yet.</p>
      ) : (
        <ul style={{ listStyle: "none", padding: 0, margin: 0 }}>
          {seforim.map((s) => (
            <li
              key={s.id}
              style={{
                padding: "14px 0",
                borderBottom: "1px solid #ddd",
                display: "flex",
                justifyContent: "space-between",
                gap: 12,
              }}
            >
              <div style={{ flex: 1 }}>
                <div style={{ fontWeight: 650 }}>
                  {s.title}
                  {s.title_he ? ` / ${s.title_he}` : ""}
                </div>
                <div style={{ opacity: 0.85 }}>
                  {s.author ?? "Unknown author"}
                  {s.author_he ? ` / ${s.author_he}` : ""}
                  {s.genre ? ` • ${s.genre}` : ""}
                </div>
                <Link to={`/seforim/${s.id}/edit`}>Edit</Link>
              </div>

              <div>
                <button
                  type="button"
                  onClick={() => handleAdd(s.id)}
                  disabled={!token || addingId === s.id}
                >
                  {addingId === s.id ? "Adding..." : "Add to my library"}
                </button>
                <button
                  type="button"
                  onClick={() => handleDelete(s.id)}
                  disabled={deletingId === s.id}
                >
                  {deletingId === s.id ? "Deleting..." : "Delete"}
                </button>
              </div>
            </li>
          ))}
        </ul>
      )}
    </div>
  );
}
