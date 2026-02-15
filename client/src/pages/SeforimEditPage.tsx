import { useEffect, useState } from "react";
import { Link, useNavigate, useParams } from "react-router-dom";
import { useAppSelector } from "../store/hooks";
import { selectToken } from "../features/auth/authSlice";
import { getSeferApi, updateSeferApi } from "../api/seforim";
import { ApiError } from "../api/http";
import { SeferAliasesPanel } from "../components/SeferAliasesPanel";
import { ReadingLogPanel } from "../components/ReadingLogPanel";

export default function SeforimEditPage() {
  const token = useAppSelector(selectToken);
  const navigate = useNavigate();
  const { seferId } = useParams<{ seferId: string }>();

  const [isLoading, setIsLoading] = useState(true);
  const [isSaving, setIsSaving] = useState(false);

  const [error, setError] = useState<string | null>(null);
  const [dupId, setDupId] = useState<string | null>(null);

  // form fields
  const [title, setTitle] = useState("");
  const [titleHe, setTitleHe] = useState("");
  const [author, setAuthor] = useState("");
  const [authorHe, setAuthorHe] = useState("");
  const [genre, setGenre] = useState("");
  const [description, setDescription] = useState("");
  const [descriptionHe, setDescriptionHe] = useState("");
  const [coverImage, setCoverImage] = useState("");

  useEffect(() => {
    if (!token || !seferId) return;

    setIsLoading(true);
    setError(null);

    getSeferApi(token, seferId)
      .then((res) => {
        const s = res.sefer;
        setTitle(s.title ?? "");
        setTitleHe(s.title_he ?? "");
        setAuthor(s.author ?? "");
        setAuthorHe(s.author_he ?? "");
        setGenre(s.genre ?? "");
        setDescription(s.description ?? "");
        setDescriptionHe(s.description_he ?? "");
        setCoverImage(s.cover_image ?? "");
      })
      .catch((e: any) => setError(e?.message ?? "Failed to load sefer"))
      .finally(() => setIsLoading(false));
  }, [token, seferId]);

  async function onSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (!token || !seferId) return;

    setError(null);
    setDupId(null);
    setIsSaving(true);

    try {
      await updateSeferApi(token, seferId, {
        title: title.trim(),
        title_he: titleHe.trim() || null,
        author: author.trim() || null,
        author_he: authorHe.trim() || null,
        genre: genre.trim() || null,
        description: description.trim() || null,
        description_he: descriptionHe.trim() || null,
        cover_image: coverImage.trim() || null,
      });

      navigate("/seforim");
    } catch (e: any) {
      const status = e instanceof ApiError ? e.status : e?.status;
      const existingId =
        e instanceof ApiError
          ? (e.details as any)?.existingSeferId
          : e?.details?.existingSeferId;

      if (status === 409 && existingId) {
        setDupId(existingId);
        setError(e.message); // should now be "Sefer already exists"
      } else {
        setError(e?.message ?? "Failed");
      }
    } finally {
      setIsSaving(false);
    }
  }

  if (!seferId) {
    return (
      <div style={{ padding: 24, fontFamily: "system-ui" }}>
        <p style={{ color: "crimson" }}>Missing seferId in route.</p>
        <Link to="/seforim">Back</Link>
      </div>
    );
  }

  return (
    <div style={{ padding: 24, fontFamily: "system-ui", maxWidth: 720 }}>
      <h1>Edit Sefer</h1>
      <p>
        <Link to="/seforim">← Back to Seforim</Link>
      </p>

      {isLoading ? (
        <p>Loading…</p>
      ) : (
        <>
          {error && (
            <div style={{ color: "crimson", marginBottom: 12 }}>
              <p>{error}</p>
              {dupId && (
                <p>
                  Existing sefer id: <code>{dupId}</code>
                </p>
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
              <input
                value={author}
                onChange={(e) => setAuthor(e.target.value)}
              />
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
              Cover image URL
              <input
                value={coverImage}
                onChange={(e) => setCoverImage(e.target.value)}
                placeholder="https://..."
              />
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
              {isSaving ? "Saving..." : "Save changes"}
            </button>
          </form>

          <div>
            <ReadingLogPanel seferId={seferId} />
          </div>

          <div style={{ marginTop: 24 }}>
            <SeferAliasesPanel seferId={seferId} />
          </div>
        </>
      )}
    </div>
  );
}
