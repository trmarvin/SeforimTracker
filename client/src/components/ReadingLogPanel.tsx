import { useEffect, useMemo, useState } from "react";
import { useAppDispatch, useAppSelector } from "../store/hooks";
import {
  fetchReadingLogsThunk,
  createReadingLogThunk,
  selectReadingLogsForSefer,
  selectReadingLogsLoading,
  selectReadingLogsError,
} from "../features/readingLogs/readingLogsSlice";

type RefKind = "daf" | "siman" | "perek" | "shaar";

export function ReadingLogPanel({ seferId }: { seferId: string }) {
  const dispatch = useAppDispatch();
  const logs = useAppSelector((s) => selectReadingLogsForSefer(s, seferId));
  const loading = useAppSelector((s) => selectReadingLogsLoading(s, seferId));
  const err = useAppSelector((s) => selectReadingLogsError(s, seferId));

  const [refKind, setRefKind] = useState<RefKind>("daf");
  const [daf, setDaf] = useState("");
  const [amud, setAmud] = useState<"a" | "b" | "">("");
  const [siman, setSiman] = useState("");
  const [seif, setSeif] = useState("");
  const [perek, setPerek] = useState("");
  const [shaar, setShaar] = useState("");
  const [notes, setNotes] = useState("");

  useEffect(() => {
    dispatch(fetchReadingLogsThunk({ seferId }));
  }, [dispatch, seferId]);

  const canSubmit = useMemo(() => {
    if (refKind === "daf") return daf.trim().length > 0;
    if (refKind === "siman") return siman.trim().length > 0;
    if (refKind === "perek") return perek.trim().length > 0;
    return shaar.trim().length > 0; // shaar
  }, [refKind, daf, siman, perek, shaar]);

  async function onAdd(e: React.FormEvent) {
    e.preventDefault();
    if (!canSubmit) return;

    await dispatch(
      createReadingLogThunk({
        seferId,
        ref_kind: refKind,

        daf: refKind === "daf" ? daf.trim() : undefined,
        amud: refKind === "daf" ? amud || undefined : undefined,

        siman: refKind === "siman" ? siman.trim() : undefined,
        seif: refKind === "siman" ? seif.trim() || undefined : undefined,

        perek: refKind === "perek" ? perek.trim() : undefined,
        shaar: refKind === "shaar" ? shaar.trim() : undefined,

        notes: notes.trim() || undefined,
      }),
    ).unwrap();

    // clear
    setNotes("");
    if (refKind === "daf") {
      setDaf("");
      setAmud("");
    } else if (refKind === "siman") {
      setSiman("");
      setSeif("");
    } else if (refKind === "perek") {
      setPerek("");
    } else {
      setShaar("");
    }
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
        <h3 style={{ margin: 0 }}>Reading log</h3>
        <button
          type="button"
          onClick={() => dispatch(fetchReadingLogsThunk({ seferId }))}
          disabled={loading}
        >
          Refresh
        </button>
      </div>

      {loading ? <p>Loading…</p> : null}
      {err ? <p style={{ color: "crimson" }}>{err}</p> : null}

      <form onSubmit={onAdd} style={{ display: "grid", gap: 8, marginTop: 10 }}>
        <label style={{ display: "flex", gap: 8, alignItems: "center" }}>
          Type:
          <select
            value={refKind}
            onChange={(e) => setRefKind(e.target.value as RefKind)}
          >
            <option value="daf">Daf</option>
            <option value="siman">Siman → Seif</option>
            <option value="perek">Perek</option>
            <option value="shaar">Sha'ar</option>
          </select>
        </label>

        {/* Daf */}
        {refKind === "daf" && (
          <div style={{ display: "flex", gap: 8, alignItems: "center" }}>
            <input
              value={daf}
              onChange={(e) => setDaf(e.target.value)}
              placeholder="Daf (e.g. 12)"
            />
            <select
              value={amud}
              onChange={(e) => setAmud(e.target.value as any)}
            >
              <option value="">(amud)</option>
              <option value="a">a</option>
              <option value="b">b</option>
            </select>
          </div>
        )}

        {/* Siman */}
        {refKind === "siman" && (
          <div style={{ display: "flex", gap: 8, alignItems: "center" }}>
            <input
              value={siman}
              onChange={(e) => setSiman(e.target.value)}
              placeholder="Siman (e.g. 141)"
            />
            <input
              value={seif}
              onChange={(e) => setSeif(e.target.value)}
              placeholder="Seif (optional)"
            />
          </div>
        )}

        {/* Perek */}
        {refKind === "perek" && (
          <div>
            <input
              value={perek}
              onChange={(e) => setPerek(e.target.value)}
              placeholder="Perek (e.g. 3)"
            />
          </div>
        )}

        {/* Sha'ar */}
        {refKind === "shaar" && (
          <div>
            <input
              value={shaar}
              onChange={(e) => setShaar(e.target.value)}
              placeholder="Sha'ar"
            />
          </div>
        )}

        <input
          value={notes}
          onChange={(e) => setNotes(e.target.value)}
          placeholder="Notes (optional)"
        />

        <button type="submit" disabled={!canSubmit}>
          Add entry
        </button>
      </form>

      <div style={{ marginTop: 12 }}>
        {logs.length === 0 ? <p>No entries yet.</p> : null}
        <ul style={{ paddingLeft: 18 }}>
          {logs.slice(0, 10).map((l) => (
            <li key={l.id} style={{ marginBottom: 6 }}>
              <strong>{l.ref_label}</strong>{" "}
              <span style={{ opacity: 0.7 }}>
                ({new Date(l.logged_at).toLocaleString()})
              </span>
              {l.notes ? <div style={{ opacity: 0.9 }}>{l.notes}</div> : null}
            </li>
          ))}
        </ul>
      </div>
    </section>
  );
}
