import { BrowserRouter, Routes, Route, Navigate } from "react-router-dom";
import { useAppSelector } from "./store/hooks";
import { selectToken } from "./features/auth/authSlice";
import LoginPage from "./pages/LoginPage";
import LandingPage from "./pages/LandingPage";
import LibraryPage from "./pages/LibraryPage";
import SeforimPage from "./pages/SeforimPage";
import SeforimNewPage from "./pages/SeforimNewPage";
import SeforimEditPage from "./pages/SeforimEditPage";
import { AppShell } from "./components/AppShell";

function ProtectedRoute({ children }: { children: React.ReactNode }) {
  const token = useAppSelector(selectToken);
  return token ? <>{children}</> : <Navigate to="/login" replace />;
}

export default function App() {
  return (
    <BrowserRouter>
      <Routes>
        <Route
          path="/"
          element={
            <AppShell>
              <LandingPage />
            </AppShell>
          }
        />
        <Route
          path="/login"
          element={
            <AppShell>
              <LoginPage />
            </AppShell>
          }
        />
        <Route
          path="/library"
          element={
            <AppShell>
              <ProtectedRoute>
                <LibraryPage />
              </ProtectedRoute>
            </AppShell>
          }
        />
        <Route
          path="/seforim"
          element={
            <AppShell>
              <ProtectedRoute>
                <SeforimPage />
              </ProtectedRoute>
            </AppShell>
          }
        />
        <Route
          path="/seforim/new"
          element={
            <AppShell>
              <ProtectedRoute>
                <SeforimNewPage />
              </ProtectedRoute>
            </AppShell>
          }
        />
        <Route
          path="/seforim/:seferId/edit"
          element={
            <AppShell>
              <ProtectedRoute>
                <SeforimEditPage />
              </ProtectedRoute>
            </AppShell>
          }
        />
      </Routes>
    </BrowserRouter>
  );
}
