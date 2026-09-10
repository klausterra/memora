import { Navigate } from "react-router-dom";
import { BrandMark } from "../components/BrandMark";
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
        <div className="brand brand-row" style={{ marginBottom: 8, justifyContent: "center" }}>
          <BrandMark size={44} />
          Memora
        </div>
        <h1 className="serif" style={{ fontSize: 36, margin: "0 0 12px" }}>
          Entre para continuar sua história
        </h1>
        <p className="muted" style={{ marginBottom: 24 }}>
          Entre com sua conta Google para continuar de onde parou.
        </p>
        <button className="btn btn-primary" style={{ width: "100%", justifyContent: "center" }} onClick={() => void login()} disabled={loading}>
          Continuar com Google
        </button>
      </div>
    </div>
  );
}
