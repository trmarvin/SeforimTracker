import { useEffect, useState } from "react";
import { useParams, NavLink } from "react-router-dom";
import { useAppDispatch, useAppSelector } from "../store/hooks";
import {
  fetchSeferByIdThunk,
  selectSeferById,
} from "../features/library/librarySlice";
import { fetchReadingLogsThunk } from "../features/readingLogs/readingLogsSlice";
import { ReadingLogPanel } from "../components/ReadingLogPanel";

// TODO: swap these selectors/thunks to match your sefer slice once you confirm names
// import { fetchSeferByIdThunk, selectSeferById } from "../features/seforim/seforimSlice";

type TabKey = "details" | "my-reading";

export default function SeferPage() {
  const { seferId } = useParams<{ seferId: string }>();
  const dispatch = useAppDispatch();

  const [tab, setTab] = useState<TabKey>("details");

  const token = useAppSelector((s) => s.auth.token);
  const sefer = useAppSelector((s) =>
    seferId ? selectSeferById(s, seferId) : undefined,
  );

  const logs = useAppSelector((s) =>
    seferId ? (s.readingLogs.bySeferId[seferId] ?? []) : [],
  );
  const logsLoading = useAppSelector((s) =>
    seferId ? !!s.readingLogs.loadingBySeferId[seferId] : false,
  );
  const logsError = useAppSelector((s) =>
    seferId ? s.readingLogs.errorBySeferId[seferId] : null,
  );

  useEffect(() => {
    if (!seferId || !token) return;

    dispatch(fetchSeferByIdThunk({ token, seferId }));
    dispatch(fetchReadingLogsThunk({ seferId }));
  }, [dispatch, seferId, token]);

  if (!seferId) {
    return <div style={{ padding: 16 }}>Missing sefer id.</div>;
  }

  return (
    <div style={{ padding: 16, maxWidth: 900, margin: "0 auto" }}>
      {/* Header */}
      <header
        style={{
          display: "flex",
          alignItems: "baseline",
          justifyContent: "space-between",
          gap: 12,
        }}
      >
        <div>
          <h1 style={{ margin: 0 }}>
            {sefer?.title ?? "Sefer"}
            {sefer?.title_he ? ` / ${sefer.title_he}` : ""}
          </h1>

          <div style={{ opacity: 0.85 }}>
            {sefer?.author ?? "Unknown author"}
            {sefer?.author_he ? ` / ${sefer.author_he}` : ""}
            {sefer?.genre ? ` • ${sefer.genre}` : ""}
          </div>
        </div>

        <NavLink to="/library" style={{ fontSize: 14 }}>
          ← Back to Library
        </NavLink>
      </header>

      {/* Tabs */}
      <div
        style={{
          display: "flex",
          gap: 8,
          marginTop: 16,
          borderBottom: "1px solid rgba(0,0,0,0.1)",
        }}
      >
        <button
          type="button"
          onClick={() => setTab("details")}
          style={{
            padding: "10px 12px",
            border: "none",
            background: "transparent",
            borderBottom:
              tab === "details"
                ? "2px solid currentColor"
                : "2px solid transparent",
            cursor: "pointer",
            fontWeight: tab === "details" ? 600 : 400,
          }}
        >
          Details
        </button>

        <button
          type="button"
          onClick={() => setTab("my-reading")}
          style={{
            padding: "10px 12px",
            border: "none",
            background: "transparent",
            borderBottom:
              tab === "my-reading"
                ? "2px solid currentColor"
                : "2px solid transparent",
            cursor: "pointer",
            fontWeight: tab === "my-reading" ? 600 : 400,
          }}
        >
          My Reading
        </button>
      </div>

      {/* Panels */}
      <main style={{ marginTop: 16 }}>
        {tab === "details" ? (
          <DetailsPanel
            sefer={sefer}
            // sefer={sefer}
            logsCount={logs.length}
          />
        ) : (
          <MyReadingPanel
            seferId={seferId}
            loading={logsLoading}
            error={logsError}
          />
        )}
      </main>
    </div>
  );
}

function DetailsPanel({
  sefer,
  logsCount,
}: {
  sefer?: any;
  logsCount: number;
}) {
  return (
    <section style={{ display: "grid", gap: 16 }}>
      <div
        style={{
          padding: 16,
          border: "1px solid rgba(0,0,0,0.1)",
          borderRadius: 12,
        }}
      >
        <h2 style={{ marginTop: 0 }}>About this sefer</h2>

        <div style={{ display: "grid", gap: 8 }}>
          <DetailRow label="Title">
            {sefer?.title ?? "—"}
            {sefer?.title_he ? ` / ${sefer.title_he}` : ""}
          </DetailRow>

          <DetailRow label="Author">
            {sefer?.author ?? "Unknown"}
            {sefer?.author_he ? ` / ${sefer.author_he}` : ""}
          </DetailRow>

          {sefer?.genre && <DetailRow label="Genre">{sefer.genre}</DetailRow>}
        </div>
      </div>

      <div
        style={{
          padding: 16,
          border: "1px solid rgba(0,0,0,0.1)",
          borderRadius: 12,
        }}
      >
        <h2 style={{ marginTop: 0 }}>Your learning</h2>
        <DetailRow label="Log entries">{logsCount}</DetailRow>
      </div>
    </section>
  );
}

function DetailRow({
  label,
  children,
}: {
  label: string;
  children: React.ReactNode;
}) {
  return (
    <div style={{ display: "flex", gap: 8 }}>
      <div style={{ minWidth: 90, opacity: 0.6 }}>{label}</div>
      <div>{children}</div>
    </div>
  );
}

function MyReadingPanel(props: {
  seferId: string;
  loading: boolean;
  error: string | null;
}) {
  return (
    <section style={{ display: "grid", gap: 12 }}>
      {props.error ? (
        <div
          style={{
            padding: 12,
            border: "1px solid rgba(255,0,0,0.3)",
            borderRadius: 10,
          }}
        >
          <strong>Error:</strong> {props.error}
        </div>
      ) : null}

      {props.loading ? (
        <div style={{ opacity: 0.7 }}>Loading your reading log…</div>
      ) : null}

      {/* This assumes your ReadingLogPanel takes seferId prop. If it doesn't yet, we’ll adjust. */}
      <ReadingLogPanel seferId={props.seferId} />
    </section>
  );
}

function StatCard({ label, value }: { label: string; value: string }) {
  return (
    <div
      style={{
        padding: 12,
        border: "1px solid rgba(0,0,0,0.1)",
        borderRadius: 10,
        minWidth: 160,
      }}
    >
      <div style={{ fontSize: 12, opacity: 0.7 }}>{label}</div>
      <div style={{ fontSize: 22, fontWeight: 700 }}>{value}</div>
    </div>
  );
}
