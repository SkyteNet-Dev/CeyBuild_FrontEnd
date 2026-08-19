"use client";

export default function Error({
  error,
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  return (
    <div style={{ fontFamily: "system-ui, sans-serif", padding: "2rem", background: "#fff", color: "#000", minHeight: "60vh", display: "flex", flexDirection: "column", alignItems: "center", justifyContent: "center" }}>
      <h2 style={{ color: "red", marginBottom: "1rem" }}>Page Error</h2>
      <details style={{ whiteSpace: "pre-wrap", maxWidth: "800px", width: "100%" }}>
        <summary>Error details</summary>
        {error.message}
        {error.stack && (
          <pre style={{ marginTop: "0.5rem", fontSize: "12px", overflow: "auto" }}>
            {error.stack}
          </pre>
        )}
      </details>
      <button
        onClick={() => reset()}
        style={{
          marginTop: "1rem",
          padding: "0.5rem 1rem",
          background: "#2563eb",
          color: "#fff",
          border: "none",
          borderRadius: "0.5rem",
          cursor: "pointer",
        }}
      >
        Try again
      </button>
    </div>
  );
}
