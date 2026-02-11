import { useEffect, useMemo, useState } from "react";
import { useAppDispatch, useAppSelector } from "../store/hooks";
import {
  fetchAliasesThunk,
  createAliasThunk,
  deleteAliasThunk,
  selectAliasesForSefer,
  selectAliasesLoading,
  selectAliasesError,
  type AliasLang,
  type AliasType,
} from "../features/seferAliases/seferAliasesSlice";

export function SeferAliasesPanel({ seferId }: { seferId: string }) {
  const dispatch = useAppDispatch();

  const aliases = useAppSelector((s) => selectAliasesForSefer(s, seferId));
  const loading = useAppSelector((s) => selectAliasesLoading(s, seferId));
  const err = useAppSelector((s) => selectAliasesError(s, seferId));

  const [type, setType] = useState<AliasType>("title");
  const [language, setLanguage] = useState<AliasLang>("en");
  const [value, setValue] = useState("");

  useEffect(() => {
    dispatch(fetchAliasesThunk({ seferId }));
  }, [dispatch, seferId]);

  const sorted = useMemo(() => {
    return [...aliases].sort((a, b) => {
      if (a.type !== b.type) return a.type.localeCompare(b.type);
      return a.value.localeCompare(b.value);
    });
  }, [aliases]);

  async function onAdd(e: React.FormEvent) {
    e.preventDefault();

    console.log("clicked add", { seferId, type, language, value });

    const trimmed = value.trim();
    if (!trimmed) return;

    try {
      await dispatch(
        createAliasThunk({
          seferId,
          type,
          value: trimmed,
          language,
        }),
      ).unwrap();

      console.log("alias created successfully");
      setValue("");
    } catch (err) {
      console.error("createAliasThunk failed:", err);
    }
  }

  async function onDelete(aliasId: number) {
    await dispatch(deleteAliasThunk({ seferId, aliasId }));
  }

  return (
    <section style={{ border: "1px solid #ddd", padding: 12, borderRadius: 8 }}>
      <div
        style={{
          display: "flex",
          justifyContent: "space-between",
          alignItems: "baseline",
        }}
      >
        <h3 style={{ margin: 0 }}>Aliases</h3>
        <button
          type="button"
          onClick={() => dispatch(fetchAliasesThunk({ seferId }))}
          disabled={loading}
        >
          Refresh
        </button>
      </div>

      {loading ? <p>Loading…</p> : null}
      {err ? <p style={{ color: "crimson" }}>{err}</p> : null}

      {sorted.length === 0 && !loading ? <p>No aliases yet.</p> : null}

      <ul style={{ paddingLeft: 18 }}>
        {sorted.map((a) => (
          <li key={a.id} style={{ marginBottom: 6 }}>
            <code>{a.type}</code>{" "}
            {a.language ? <span>({a.language}) </span> : null}
            <strong>{a.value}</strong>
            <button
              type="button"
              onClick={() => onDelete(a.id)}
              style={{ marginLeft: 8 }}
            >
              delete
            </button>
          </li>
        ))}
      </ul>

      <form
        onSubmit={onAdd}
        style={{ display: "flex", gap: 8, alignItems: "center" }}
      >
        <select
          value={type}
          onChange={(e) => setType(e.target.value as AliasType)}
        >
          <option value="title">title</option>
          <option value="author">author</option>
          <option value="abbr">abbr</option>
          <option value="other">other</option>
        </select>

        <select
          value={language ?? ""}
          onChange={(e) => setLanguage((e.target.value || null) as AliasLang)}
        >
          <option value="en">en</option>
          <option value="he">he</option>
          <option value="mixed">mixed</option>
          <option value="">(none)</option>
        </select>

        <input
          value={value}
          onChange={(e) => setValue(e.target.value)}
          placeholder="Add an alias…"
          style={{ flex: 1 }}
        />

        <button type="submit" disabled={!value.trim() || loading}>
          Add
        </button>
      </form>
    </section>
  );
}
