import { useEffect, useState } from "react";

/** Tracks browser connectivity so the badge flips to Offline mode instantly. */
function useConnectionStatus() {
  const [online, setOnline] = useState(true);

  useEffect(() => {
    const update = () => setOnline(navigator.onLine);
    update();
    window.addEventListener("online", update);
    window.addEventListener("offline", update);
    return () => {
      window.removeEventListener("online", update);
      window.removeEventListener("offline", update);
    };
  }, []);

  return online;
}

export function ConnectionBadge() {
  const online = useConnectionStatus();

  return (
    <span
      className={`status-pill ${online ? "status-pill-online" : "status-pill-offline"}`}
      aria-live="polite"
    >
      <span className="status-dot" aria-hidden="true" />
      {online ? "Online" : "Offline mode"}
    </span>
  );
}
