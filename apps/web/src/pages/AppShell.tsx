import { Link, Navigate, Outlet, useLocation } from "react-router-dom";
import { BrandMark } from "../components/BrandMark";
import { useAuth } from "../lib/auth";

export function AppShell() {
  const { user, loading, profile, isAdmin, logout } = useAuth();
  const location = useLocation();

  if (loading) {
    return (
      <div className="wrap" style={{ display: "grid", placeItems: "center" }}>
        <p className="muted">Abrindo sua memória…</p>
      </div>
    );
  }

  if (!user) return <Navigate to="/login" replace state={{ from: location }} />;

  const name = profile?.preferredName || user.displayName?.split(" ")[0] || "você";

  return (
    <div className="wrap">
      <header
        style={{
          maxWidth: 880,
          margin: "0 auto",
          padding: "24px 20px 8px",
          display: "flex",
          justifyContent: "space-between",
          alignItems: "center",
          gap: 16,
        }}
      >
        <div>
          <Link to="/app" className="brand brand-row" style={{ textDecoration: "none" }}>
            <BrandMark size={34} />
            Memora
          </Link>
          <div className="muted" style={{ fontSize: 13 }}>
            Olá, {name}
            {isAdmin ? " · admin" : ""}
          </div>
        </div>
        <nav style={{ display: "flex", gap: 10, alignItems: "center", flexWrap: "wrap" }}>
          {(
            [
              ["/app", "Hoje"],
              ["/app/timeline", "Timeline"],
              ["/app/memories", "Memórias"],
            ] as const
          ).map(([to, label]) => {
            const active =
              to === "/app" ? location.pathname === "/app" : location.pathname.startsWith(to);
            return (
              <Link
                key={to}
                className={active ? "btn btn-ink" : "btn btn-ghost"}
                to={to}
                aria-current={active ? "page" : undefined}
              >
                {label}
              </Link>
            );
          })}
          <button className="btn btn-ghost" onClick={() => void logout()}>
            Sair
          </button>
        </nav>
      </header>
      <main style={{ maxWidth: 880, margin: "0 auto", padding: "12px 20px 64px" }}>
        <Outlet />
      </main>
    </div>
  );
}
