import { BrowserRouter, Routes, Route, Navigate } from "react-router-dom";
import { useAppSelector } from "./store/hooks";
import { selectToken } from "./features/auth/authSlice";
import LoginPage from "./pages/LoginPage";
import LandingPage from "./pages/LandingPage";
import LibraryPage from "./pages/LibraryPage";
import SeforimPage from "./pages/SeforimPage";
import SeforimNewPage from "./pages/SeforimNewPage";
import SeforimEditPage from "./pages/SeforimEditPage";

function ProtectedRoute({ children }: { children: React.ReactNode }) {
  const token = useAppSelector(selectToken);
  return token ? <>{children}</> : <Navigate to="/login" replace />;
}

export default function App() {
  return (
    <BrowserRouter>
      <Routes>
        <Route path="/" element={<LandingPage />} />
        <Route path="/login" element={<LoginPage />} />
        <Route
          path="/library"
          element={
            <ProtectedRoute>
              <LibraryPage />
            </ProtectedRoute>
          }
        />
        <Route
          path="/seforim"
          element={
            <ProtectedRoute>
              <SeforimPage />
            </ProtectedRoute>
          }
        />
        <Route
          path="/seforim/new"
          element={
            <ProtectedRoute>
              <SeforimNewPage />
            </ProtectedRoute>
          }
        />
        <Route
          path="/seforim/:seferId/edit"
          element={
            <ProtectedRoute>
              <SeforimEditPage />
            </ProtectedRoute>
          }
        />
      </Routes>
    </BrowserRouter>
  );
}
