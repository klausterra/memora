import { Link } from "react-router-dom";
import { BrandMark } from "../components/BrandMark";
import { useAuth } from "../lib/auth";

export function LandingPage() {
  const { user } = useAuth();

  return (
    <div className="wrap">
      <header
        style={{
          maxWidth: 1120,
          margin: "0 auto",
          padding: "28px 24px",
          display: "flex",
          justifyContent: "space-between",
          alignItems: "center",
        }}
      >
        <div className="brand brand-row">
          <BrandMark size={40} />
          Memora
        </div>
        <Link className="btn btn-ink" to={user ? "/app" : "/login"}>
          {user ? "Abrir diário" : "Quero experimentar"}
        </Link>
      </header>

      <section
        style={{
          maxWidth: 1120,
          margin: "0 auto",
          padding: "12px 24px 72px",
          display: "grid",
          gridTemplateColumns: "1.05fr 1fr",
          gap: 48,
          alignItems: "center",
        }}
        className="hero-grid"
      >
        <div>
          <div
            style={{
              fontSize: 12,
              letterSpacing: "0.18em",
              textTransform: "uppercase",
              color: "var(--ember)",
              fontWeight: 600,
            }}
          >
            Memória pessoal inteligente
          </div>
          <h1 style={{ fontSize: "clamp(42px, 6vw, 72px)", lineHeight: 0.98, margin: "16px 0 20px" }}>
            Converse com a <em style={{ color: "var(--ember)", fontStyle: "italic" }}>sua história.</em>
          </h1>
          <p style={{ fontSize: 20, lineHeight: 1.45, color: "var(--ink-soft)", maxWidth: "34ch" }}>
            Não é um diário para preencher. É alguém que lembra da sua vida com você — a partir de cinco
            minutos de conversa.
          </p>
          <div style={{ display: "flex", gap: 12, flexWrap: "wrap", marginTop: 28 }}>
            <Link className="btn btn-primary" to={user ? "/app" : "/login"}>
              Começar com Google
            </Link>
            <a className="btn btn-ghost" href="#como">
              Como funciona
            </a>
          </div>
          <p className="muted" style={{ fontSize: 13, marginTop: 14 }}>
            Sem tags. Sem humor. Sem página em branco — só conversa.
          </p>
        </div>

        <div
          style={{
            background: "var(--card)",
            border: "1px solid var(--line)",
            borderRadius: 28,
            padding: 22,
            boxShadow: "0 30px 70px rgba(80, 48, 20, 0.08)",
          }}
        >
          <div className="muted" style={{ fontSize: 13, marginBottom: 14 }}>
            sessão de hoje
          </div>
          <p className="serif" style={{ fontSize: 26, marginTop: 0 }}>
            O que vale a pena guardar de hoje?
          </p>
          <div
            style={{
              background: "var(--ink)",
              color: "#f7f0e6",
              borderRadius: 16,
              padding: "12px 14px",
              marginLeft: "auto",
              maxWidth: "90%",
              fontSize: 15,
            }}
          >
            Hoje conversei com o João sobre o Atlas. Acho que estamos errando o posicionamento e talvez
            seja melhor simplificar.
          </div>
          <div
            style={{
              background: "#efe4d3",
              borderRadius: 16,
              padding: "12px 14px",
              marginTop: 12,
              maxWidth: "90%",
              fontSize: 15,
            }}
          >
            Parece que o Atlas pediu coragem hoje. O que mais pesou nessa conversa com o João?
          </div>
          <div style={{ display: "flex", flexWrap: "wrap", gap: 8, marginTop: 16 }}>
            {["Pessoa · João", "Projeto · Atlas", "Decisão · simplificar"].map((chip) => (
              <span
                key={chip}
                style={{
                  fontSize: 12,
                  border: "1px dashed var(--gold)",
                  background: "#f3ead4",
                  padding: "6px 10px",
                  borderRadius: 999,
                }}
              >
                {chip}
              </span>
            ))}
          </div>
        </div>
      </section>

      <section id="como" style={{ maxWidth: 1120, margin: "0 auto", padding: "20px 24px 90px" }}>
        <h2 style={{ fontSize: "clamp(32px, 4vw, 48px)", marginBottom: 12 }}>Zero formulário.</h2>
        <p style={{ color: "var(--ink-soft)", fontSize: 18, maxWidth: "46ch" }}>
          Você conversa. O Memora extrai pessoas, projetos e decisões em segundo plano — e monta sua
          timeline automaticamente.
        </p>
      </section>

      <style>{`
        @media (max-width: 880px) {
          .hero-grid { grid-template-columns: 1fr !important; }
        }
      `}</style>
    </div>
  );
}
