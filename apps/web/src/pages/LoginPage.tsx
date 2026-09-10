import { Navigate } from "react-router-dom";
import { useAuth } from "../lib/auth";

export function LoginPage() {
  const { user, loading, login } = useAuth();

  if (!loading && user) return <Navigate to="/app" replace />;

  return (
    <div className="wrap" style={{ display: "grid", placeItems: "center", padding: 24 }}>
      <div
        style={{
          width: "min(420px, 100%)",
          background: "var(--card)",
          border: "1px solid var(--line)",
          borderRadius: 28,
          padding: 32,
          textAlign: "center",
        }}
      >
        <div className="brand" style={{ marginBottom: 8 }}>
          Memora
        </div>
        <h1 className="serif" style={{ fontSize: 36, margin: "0 0 12px" }}>
          Entre para continuar sua história
        </h1>
        <p className="muted" style={{ marginBottom: 24 }}>
          Login com Google via Firebase Hipercube. Admins: Klaus e Waniele.
        </p>
        <button className="btn btn-primary" style={{ width: "100%", justifyContent: "center" }} onClick={() => void login()} disabled={loading}>
          Continuar com Google
        </button>
      </div>
    </div>
  );
}
