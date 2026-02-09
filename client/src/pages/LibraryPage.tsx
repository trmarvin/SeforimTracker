import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import { useAppDispatch, useAppSelector } from "../store/hooks";
import { logout, selectToken } from "../features/auth/authSlice";
import {
  fetchLibraryThunk,
  selectLibraryError,
  selectLibraryItems,
  selectLibraryStatus,
  updateLibraryItemThunk,
  deleteLibraryItemThunk,
} from "../features/library/librarySlice";
import type { LibraryStatus } from "../api/library";

const STATUS_OPTIONS: { value: LibraryStatus; label: string }[] = [
  { value: "to_read", label: "To read" },
  { value: "reading", label: "Reading" },
  { value: "finished", label: "Finished" },
  { value: "paused", label: "Paused" },
  { value: "did_not_finish", label: "Did not finish" },
];

export default function LibraryPage() {
  const dispatch = useAppDispatch();
  const token = useAppSelector(selectToken);

  const items = useAppSelector(selectLibraryItems);
  const status = useAppSelector(selectLibraryStatus);
  const error = useAppSelector(selectLibraryError);

  // local draft notes so typing doesn't spam PUT requests
  const [draftNotes, setDraftNotes] = useState<Record<string, string>>({});

  const [statusFilter, setStatusFilter] = useState<LibraryStatus | "all">(
    "all",
  );
  const [query, setQuery] = useState("");

  useEffect(() => {
    if (!token) return;
    dispatch(fetchLibraryThunk(token));
  }, [token, dispatch]);

  const normalizedQuery = query.trim().toLowerCase();

  const filteredItems = items.filter((it) => {
    if (statusFilter !== "all" && it.status !== statusFilter) return false;
    if (!normalizedQuery) return true;

    const s = it.sefer;

    const haystack = [
      s.title,
      s.title_he ?? "",
      s.author ?? "",
      s.author_he ?? "",
      s.genre ?? "",
      it.notes ?? "",
    ]
      .join(" ")
      .toLowerCase();

    return haystack.includes(normalizedQuery);
  });

  const totalCount = items.length;
  const filteredCount = filteredItems.length;

  return (
    <div style={{ padding: 24, fontFamily: "system-ui", maxWidth: 900 }}>
      <div
        style={{
          display: "flex",
          justifyContent: "space-between",
          alignItems: "center",
        }}
      >
        <h1>My Library</h1>
        <button type="button" onClick={() => dispatch(logout())}>
          Logout
        </button>
      </div>

      <div
        style={{
          display: "flex",
          gap: 12,
          alignItems: "center",
          margin: "12px 0",
        }}
      >
        <label style={{ display: "flex", gap: 8, alignItems: "center" }}>
          Status:
          <select
            value={statusFilter}
            onChange={(e) => setStatusFilter(e.target.value as any)}
          >
            <option value="all">All</option>
            {STATUS_OPTIONS.map((opt) => (
              <option key={opt.value} value={opt.value}>
                {opt.label}
              </option>
            ))}
          </select>
        </label>

        <input
          value={query}
          onChange={(e) => setQuery(e.target.value)}
          placeholder="Search title, author, notes…"
          style={{ flex: 1, minWidth: 240 }}
        />

        <button
          type="button"
          onClick={() => {
            setStatusFilter("all");
            setQuery("");
          }}
        >
          Clear
        </button>
        <p style={{ opacity: 0.75, margin: "8px 0" }}>
          {filteredCount === totalCount
            ? `Showing all ${totalCount}`
            : `Showing ${filteredCount} of ${totalCount}`}
        </p>
      </div>

      <div style={{ display: "flex", gap: 8 }}>
        <Link to="/seforim">Browse seforim</Link>
      </div>

      {status === "loading" && <p>Loading…</p>}
      {error && <p style={{ color: "crimson" }}>{error}</p>}

      {status !== "loading" && !error && filteredItems.length === 0 ? (
        <p>No imatching items.</p>
      ) : (
        <ul style={{ listStyle: "none", padding: 0, margin: 0 }}>
          {filteredItems.map((it) => {
            const sefer = it.sefer;
            const currentDraft = draftNotes[it.id] ?? it.notes ?? "";

            return (
              <li
                key={it.id}
                style={{ padding: "14px 0", borderBottom: "1px solid #ddd" }}
              >
                <div
                  style={{
                    display: "flex",
                    justifyContent: "space-between",
                    gap: 12,
                  }}
                >
                  <div style={{ flex: 1 }}>
                    <div style={{ fontWeight: 650 }}>
                      {sefer.title}
                      {sefer.title_he ? ` / ${sefer.title_he}` : ""}
                    </div>
                    <div style={{ opacity: 0.85 }}>
                      {sefer.author ?? "Unknown author"}
                      {sefer.author_he ? ` / ${sefer.author_he}` : ""}
                      {sefer.genre ? ` • ${sefer.genre}` : ""}
                    </div>
                  </div>

                  <div
                    style={{ display: "flex", alignItems: "center", gap: 8 }}
                  >
                    <select
                      value={it.status}
                      onChange={(e) => {
                        if (!token) return;
                        dispatch(
                          updateLibraryItemThunk({
                            token,
                            itemId: it.id,
                            patch: { status: e.target.value as LibraryStatus },
                          }),
                        );
                      }}
                    >
                      {STATUS_OPTIONS.map((opt) => (
                        <option key={opt.value} value={opt.value}>
                          {opt.label}
                        </option>
                      ))}
                    </select>

                    <button
                      type="button"
                      onClick={() => {
                        if (!token) return;
                        dispatch(
                          deleteLibraryItemThunk({ token, itemId: it.id }),
                        );
                      }}
                    >
                      Delete
                    </button>
                  </div>
                </div>

                <div style={{ marginTop: 10 }}>
                  <textarea
                    placeholder="Notes…"
                    value={currentDraft}
                    onChange={(e) =>
                      setDraftNotes((prev) => ({
                        ...prev,
                        [it.id]: e.target.value,
                      }))
                    }
                    onKeyDown={(e) => {
                      if (e.key === "Enter") {
                        e.stopPropagation();
                      }
                    }}
                    onBlur={() => {
                      if (!token) return;
                      const notes = (
                        draftNotes[it.id] ??
                        it.notes ??
                        ""
                      ).trim();
                      dispatch(
                        updateLibraryItemThunk({
                          token,
                          itemId: it.id,
                          patch: { notes: notes.length ? notes : null },
                        }),
                      );
                    }}
                    rows={2}
                    style={{ width: "100%" }}
                  />
                </div>
              </li>
            );
          })}
        </ul>
      )}
    </div>
  );
}
