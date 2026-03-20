import { useEffect, useState } from "react";

export default function IosInstallPrompt() {
  const [show, setShow] = useState(false);

  useEffect(() => {
    const isIos = /iphone|ipad|ipod/i.test(window.navigator.userAgent);
    const isStandalone = window.navigator.standalone;

    if (isIos && !isStandalone) {
      setShow(true);
    }
  }, []);

  if (!show) return null;

  return (
    <div style={styles.container}>
      <p style={styles.text}>
        Add Veloura to your home screen  
        <br />
        Tap <b>Share</b> → <b>Add to Home Screen</b>
      </p>

      <button style={styles.button} onClick={() => setShow(false)}>
        Got it
      </button>
    </div>
  );
}

const styles = {
  container: {
    position: "fixed",
    bottom: "90px",
    left: "16px",
    right: "16px",
    background: "#fff",
    borderRadius: "20px",
    padding: "16px",
    boxShadow: "0 10px 30px rgba(0,0,0,0.08)",
    zIndex: 999,
  },
  text: {
    fontSize: "14px",
    color: "#221516",
    marginBottom: "10px",
  },
  button: {
    background: "#b20f57",
    color: "#fff",
    border: "none",
    padding: "8px 16px",
    borderRadius: "999px",
    fontWeight: 600,
  },
};
