import { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { useAppSelector } from "../store/hooks";
import { selectToken } from "../features/auth/authSlice";
import { createSeferApi } from "../api/seforim";
import { addToLibraryApi } from "../api/library";

export default function SeforimNewPage() {
  const token = useAppSelector(selectToken);
  const navigate = useNavigate();

  const [title, setTitle] = useState("");
  const [titleHe, setTitleHe] = useState("");
  const [author, setAuthor] = useState("");
  const [authorHe, setAuthorHe] = useState("");
  const [genre, setGenre] = useState("");
  const [description, setDescription] = useState("");
  const [descriptionHe, setDescriptionHe] = useState("");

  const [error, setError] = useState<string | null>(null);
  const [dupId, setDupId] = useState<string | null>(null);
  const [isSaving, setIsSaving] = useState(false);

  async function onSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (!token) return;

    setError(null);
    setDupId(null);
    setIsSaving(true);

    try {
      const res = await createSeferApi(token, {
        title: title.trim(),
        title_he: titleHe.trim() || null,
        author: author.trim() || null,
        author_he: authorHe.trim() || null,
        genre: genre.trim() || null,
        description: description.trim() || null,
        description_he: descriptionHe.trim() || null,
      });

      // Nice UX: after creating a sefer, add it to the user’s library automatically
      await addToLibraryApi(token, { seferId: res.sefer.id });
      navigate("/"); // back to library
    } catch (e: any) {
      // If your apiRequest throws with status/body, handle it. Otherwise we’ll do a simpler message.
      // Common pattern: e.status and e.data (depends on your http.ts)
      const status = e?.status;
      const existingId = e?.data?.existingSeferId;

      if (status === 409 && existingId) {
        setDupId(existingId);
        setError(
          "This sefer already exists. Want to add the existing one to your library?",
        );
      } else {
        setError(e?.message ?? "Failed to create sefer");
      }
    } finally {
      setIsSaving(false);
    }
  }

  async function addExistingToLibrary() {
    if (!token || !dupId) return;
    setError(null);
    setIsSaving(true);
    try {
      await addToLibraryApi(token, { seferId: dupId });
      navigate("/");
    } catch (e: any) {
      setError(e?.message ?? "Failed to add existing sefer to library");
    } finally {
      setIsSaving(false);
    }
  }

  return (
    <div style={{ padding: 24, fontFamily: "system-ui", maxWidth: 720 }}>
      <h1>Add Sefer</h1>
      <p>
        <Link to="/seforim">← Back to Seforim</Link>
      </p>

      {error && (
        <div style={{ color: "crimson", marginBottom: 12 }}>
          <p>{error}</p>
          {dupId && (
            <button
              type="button"
              onClick={addExistingToLibrary}
              disabled={isSaving}
            >
              {isSaving ? "Adding..." : "Add existing sefer to my library"}
            </button>
          )}
        </div>
      )}

      <form onSubmit={onSubmit} style={{ display: "grid", gap: 10 }}>
        <label>
          Title (required)
          <input value={title} onChange={(e) => setTitle(e.target.value)} />
        </label>

        <label>
          Title (Hebrew)
          <input
            value={titleHe}
            onChange={(e) => setTitleHe(e.target.value)}
            dir="rtl"
          />
        </label>

        <label>
          Author
          <input value={author} onChange={(e) => setAuthor(e.target.value)} />
        </label>

        <label>
          Author (Hebrew)
          <input
            value={authorHe}
            onChange={(e) => setAuthorHe(e.target.value)}
            dir="rtl"
          />
        </label>

        <label>
          Genre
          <input value={genre} onChange={(e) => setGenre(e.target.value)} />
        </label>

        <label>
          Description
          <textarea
            value={description}
            onChange={(e) => setDescription(e.target.value)}
            rows={3}
          />
        </label>

        <label>
          Description (Hebrew)
          <textarea
            value={descriptionHe}
            onChange={(e) => setDescriptionHe(e.target.value)}
            rows={3}
            dir="rtl"
          />
        </label>

        <button type="submit" disabled={isSaving || !title.trim()}>
          {isSaving ? "Saving..." : "Create sefer"}
        </button>
      </form>
    </div>
  );
}
