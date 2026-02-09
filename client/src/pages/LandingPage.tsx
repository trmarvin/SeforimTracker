import { Link } from "react-router-dom";
import { useAppSelector } from "../store/hooks";
import { selectToken } from "../features/auth/authSlice";

export default function LandingPage() {
  const token = useAppSelector(selectToken);

  return (
    <div
      style={{
        padding: 32,
        fontFamily: "system-ui",
        maxWidth: 900,
        margin: "0 auto",
      }}
    >
      <h1 style={{ fontSize: 42, marginBottom: 10 }}>SeforimTracker</h1>
      <p style={{ fontSize: 18, opacity: 0.85, maxWidth: 620 }}>
        Track your seforim, reading status, and notes — with bilingual metadata.
      </p>

      <div style={{ marginTop: 20, display: "flex", gap: 12 }}>
        {token ? (
          <>
            <Link to="/library" style={btnPrimary}>
              Go to My Library
            </Link>
            <Link to="/seforim" style={btnGhost}>
              Browse Seforim
            </Link>
          </>
        ) : (
          <>
            <Link to="/login" style={btnPrimary}>
              Log in
            </Link>
            <Link to="/register" style={btnGhost}>
              Create account
            </Link>
          </>
        )}
      </div>

      <div style={{ marginTop: 40, display: "grid", gap: 12, maxWidth: 720 }}>
        <Feature
          title="Reading statuses"
          text="To read, reading, finished, paused, and DNF."
        />
        <Feature
          title="Notes that autosave"
          text="Write thoughts while you read. Saves on blur."
        />
        <Feature
          title="Bilingual fields"
          text="Title/author/description in English + Hebrew."
        />
      </div>
    </div>
  );
}

function Feature({ title, text }: { title: string; text: string }) {
  return (
    <div style={{ border: "1px solid #ddd", borderRadius: 12, padding: 16 }}>
      <div style={{ fontWeight: 700, marginBottom: 6 }}>{title}</div>
      <div style={{ opacity: 0.85 }}>{text}</div>
    </div>
  );
}

const btnPrimary: React.CSSProperties = {
  display: "inline-block",
  padding: "10px 14px",
  borderRadius: 10,
  border: "1px solid #111",
  background: "#111",
  color: "#fff",
  textDecoration: "none",
  fontWeight: 650,
};

const btnGhost: React.CSSProperties = {
  display: "inline-block",
  padding: "10px 14px",
  borderRadius: 10,
  border: "1px solid #ddd",
  background: "#fff",
  color: "#111",
  textDecoration: "none",
  fontWeight: 650,
};
