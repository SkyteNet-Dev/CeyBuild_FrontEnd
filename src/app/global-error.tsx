"use client";

export default function GlobalError({
  error,
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  return (
    <html lang="en">
      <body style={{ fontFamily: "system-ui, sans-serif", padding: "2rem", background: "#fff", color: "#000" }}>
        <h2 style={{ color: "red" }}>Something went wrong!</h2>
        <details style={{ whiteSpace: "pre-wrap", marginTop: "1rem" }}>
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
      </body>
    </html>
  );
}
