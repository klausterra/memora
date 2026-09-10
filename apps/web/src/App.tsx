import { BrowserRouter, Navigate, Route, Routes } from "react-router-dom";
import { AuthProvider } from "./lib/auth";
import { LandingPage } from "./pages/LandingPage";
import { LoginPage } from "./pages/LoginPage";
import { AppShell } from "./pages/AppShell";
import { TodayPage } from "./pages/TodayPage";
import { TimelinePage } from "./pages/TimelinePage";
import { MemoriesPage } from "./pages/MemoriesPage";
import { PwaInstallPrompt } from "./components/PwaInstallPrompt";

export function App() {
  return (
    <AuthProvider>
      <BrowserRouter>
        <Routes>
          <Route path="/" element={<LandingPage />} />
          <Route path="/login" element={<LoginPage />} />
          <Route path="/app" element={<AppShell />}>
            <Route index element={<TodayPage />} />
            <Route path="timeline" element={<TimelinePage />} />
            <Route path="memories" element={<MemoriesPage />} />
          </Route>
          <Route path="*" element={<Navigate to="/" replace />} />
        </Routes>
        <PwaInstallPrompt />
      </BrowserRouter>
    </AuthProvider>
  );
}
