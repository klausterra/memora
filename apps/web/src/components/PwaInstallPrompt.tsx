import { useEffect, useRef, useState } from "react";

type BeforeInstallPromptEvent = Event & {
  prompt: () => Promise<void>;
  userChoice: Promise<{ outcome: "accepted" | "dismissed" }>;
};

const DISMISS_KEY = "memora.pwa.install.dismissedAt";
const DISMISS_DAYS = 14;

function wasDismissedRecently(): boolean {
  try {
    const raw = localStorage.getItem(DISMISS_KEY);
    if (!raw) return false;
    const at = Number(raw);
    if (!Number.isFinite(at)) return false;
    return Date.now() - at < DISMISS_DAYS * 24 * 60 * 60 * 1000;
  } catch {
    return false;
  }
}

function isStandalone(): boolean {
  return (
    window.matchMedia("(display-mode: standalone)").matches ||
    ("standalone" in navigator && Boolean((navigator as Navigator & { standalone?: boolean }).standalone))
  );
}

function isIosSafari(): boolean {
  const ua = navigator.userAgent;
  const iOS =
    /iPad|iPhone|iPod/.test(ua) || (navigator.platform === "MacIntel" && navigator.maxTouchPoints > 1);
  const webkit = /WebKit/.test(ua);
  const other = /CriOS|FxiOS|EdgiOS/.test(ua);
  return iOS && webkit && !other;
}

export function PwaInstallPrompt() {
  const [deferred, setDeferred] = useState<BeforeInstallPromptEvent | null>(null);
  const [visible, setVisible] = useState(false);
  const [iosHint, setIosHint] = useState(false);
  const [busy, setBusy] = useState(false);
  const [showHowTo, setShowHowTo] = useState(false);
  const gotPrompt = useRef(false);

  useEffect(() => {
    if (isStandalone() || wasDismissedRecently()) return;

    const onBeforeInstall = (event: Event) => {
      event.preventDefault();
      gotPrompt.current = true;
      setDeferred(event as BeforeInstallPromptEvent);
      setIosHint(false);
      setVisible(true);
    };
    window.addEventListener("beforeinstallprompt", onBeforeInstall);

    const timer = window.setTimeout(() => {
      if (gotPrompt.current || isStandalone() || wasDismissedRecently()) return;
      if (isIosSafari()) {
        setIosHint(true);
        setVisible(true);
        return;
      }
      // Soft promo until the browser exposes beforeinstallprompt
      setVisible(true);
    }, 3200);

    return () => {
      window.removeEventListener("beforeinstallprompt", onBeforeInstall);
      window.clearTimeout(timer);
    };
  }, []);

  function dismiss() {
    try {
      localStorage.setItem(DISMISS_KEY, String(Date.now()));
    } catch {
      /* ignore */
    }
    setVisible(false);
    setDeferred(null);
  }

  async function install() {
    if (!deferred) return;
    setBusy(true);
    try {
      await deferred.prompt();
      await deferred.userChoice;
      setVisible(false);
      setDeferred(null);
    } finally {
      setBusy(false);
    }
  }

  if (!visible) return null;

  return (
    <div className="pwa-install" role="dialog" aria-label="Instalar Memora">
      <img className="pwa-install__icon" src="/icon-192.png" alt="" width={64} height={64} />
      <div className="pwa-install__copy">
        <strong>Instalar o Memora</strong>
        <p>
          {iosHint
            ? "No Safari: toque em Compartilhar e depois em “Adicionar à Tela de Início”."
            : showHowTo
              ? "No Chrome/Edge: menu ⋮ → “Instalar Memora” ou “Instalar aplicativo”."
              : "Adicione à tela inicial e abra como app — rápido, sem barra do navegador."}
        </p>
      </div>
      <div className="pwa-install__actions">
        {!iosHint && deferred && (
          <button className="btn btn-primary" type="button" disabled={busy} onClick={() => void install()}>
            Instalar
          </button>
        )}
        {!iosHint && !deferred && (
          <button className="btn btn-primary" type="button" onClick={() => setShowHowTo(true)}>
            Como instalar
          </button>
        )}
        <button className="btn btn-ghost" type="button" onClick={dismiss}>
          Agora não
        </button>
      </div>
    </div>
  );
}
