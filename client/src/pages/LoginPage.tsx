import { useState } from "react";
import { useAppDispatch, useAppSelector } from "../store/hooks";
import {
  loginThunk,
  logout,
  selectAuthError,
  selectAuthStatus,
  selectToken,
} from "../features/auth/authSlice";

/* TEST USER
  "email": "tamar@test.com",
  "password": "password123",
  "name": "Tamar"
*/

export default function App() {
  const dispatch = useAppDispatch();
  const token = useAppSelector(selectToken);
  const status = useAppSelector(selectAuthStatus);
  const error = useAppSelector(selectAuthError);

  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");

  return (
    <div style={{ padding: 24, fontFamily: "system-ui", maxWidth: 520 }}>
      <h1>SeforimTracker</h1>

      {token ? (
        <>
          <p>Logged in ✅</p>
          <p style={{ wordBreak: "break-all" }}>
            <strong>Token:</strong> {token}
          </p>
          <button onClick={() => dispatch(logout())}>Logout</button>
        </>
      ) : (
        <>
          <p>Login</p>
          <form
            onSubmit={(e) => {
              e.preventDefault();
              dispatch(loginThunk({ email, password }));
            }}
          >
            <div style={{ marginBottom: 12 }}>
              <label>Email</label>
              <input
                style={{ width: "100%" }}
                value={email}
                onChange={(e) => setEmail(e.target.value)}
              />
            </div>

            <div style={{ marginBottom: 12 }}>
              <label>Password</label>
              <input
                style={{ width: "100%" }}
                type="password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
              />
            </div>

            <button type="submit" disabled={status === "loading"}>
              {status === "loading" ? "Logging in..." : "Login"}
            </button>

            {error && <p style={{ color: "crimson" }}>{error}</p>}
          </form>
        </>
      )}
    </div>
  );
}
