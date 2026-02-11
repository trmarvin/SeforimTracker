import { Link } from "react-router-dom";
import { useAppDispatch, useAppSelector } from "../store/hooks";
import { logout, selectToken } from "../features/auth/authSlice";

export function AppShell({ children }: { children: React.ReactNode }) {
  const token = useAppSelector(selectToken);
  const dispatch = useAppDispatch();

  return (
    <>
      <header className="header">
        <div className="container header-inner">
          <Link className="brand" to="/">
            SeforimTracker
          </Link>

          <nav className="nav">
            {token ? (
              <>
                <Link to="/library">Library</Link>
                <Link to="/seforim">Seforim</Link>
                <Link to="/seforim/new">Add Sefer</Link>
                <button
                  type="button"
                  className="btn"
                  onClick={() => dispatch(logout())}
                >
                  Logout
                </button>
              </>
            ) : (
              <>
                <Link to="/login">Log in</Link>
                <Link to="/register">Register</Link>
              </>
            )}
          </nav>
        </div>
      </header>

      <main className="container">{children}</main>
    </>
  );
}
