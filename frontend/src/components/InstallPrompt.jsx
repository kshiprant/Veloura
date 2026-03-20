import { useEffect, useState } from "react";

export default function InstallPrompt() {
  const [deferredPrompt, setDeferredPrompt] = useState(null);

  useEffect(() => {
    const handler = (e) => {
      e.preventDefault(); // stop default mini-infobar
      setDeferredPrompt(e);
    };

    window.addEventListener("beforeinstallprompt", handler);

    return () => {
      window.removeEventListener("beforeinstallprompt", handler);
    };
  }, []);

  const handleInstall = async () => {
    if (!deferredPrompt) return;

    deferredPrompt.prompt();
    const choice = await deferredPrompt.userChoice;

    if (choice.outcome === "accepted") {
      console.log("User installed Veloura");
      setDeferredPrompt(null);
    }
  };

  if (!deferredPrompt) return null;

  return (
    <div style={styles.container}>
      <span style={styles.text}>Add Veloura to your home screen</span>
      <button style={styles.button} onClick={handleInstall}>
        Add
      </button>
    </div>
  );
}

const styles = {
  container: {
    position: "fixed",
    bottom: "20px",
    left: "16px",
    right: "16px",
    background: "#fff",
    borderRadius: "20px",
    padding: "14px 16px",
    display: "flex",
    justifyContent: "space-between",
    alignItems: "center",
    boxShadow: "0 10px 30px rgba(0,0,0,0.08)",
    zIndex: 999,
  },
  text: {
    fontSize: "14px",
    color: "#221516",
  },
  button: {
    background: "#b20f57",
    color: "#fff",
    border: "none",
    padding: "8px 16px",
    borderRadius: "999px",
    fontWeight: 600,
    cursor: "pointer",
  },
};
