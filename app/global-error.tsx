"use client";

import Link from "next/link";

export default function GlobalError({ reset }: { error: Error & { digest?: string }; reset: () => void }) {
  return (
    <html lang="en">
      <body style={{ margin: 0, fontFamily: "system-ui, sans-serif", background: "#fff8ef", color: "#452a31" }}>
        <main style={{ minHeight: "100vh", display: "grid", placeItems: "center", padding: 24 }}>
          <section role="alert" aria-live="assertive" style={{ maxWidth: 520, borderRadius: 16, padding: 32, background: "white", border: "1px solid #ead7c5" }}>
            <h1 style={{ marginTop: 0 }}>Something went wrong</h1>
            <p>We could not load this page. No private details are displayed here.</p>
            <button type="button" onClick={reset} style={{ marginTop: 12, cursor: "pointer", border: 0, borderRadius: 8, padding: "12px 20px", background: "#722b3c", color: "#fff", fontWeight: 700 }}>Try again</button>
            <p style={{ marginTop: 22, fontSize: 13 }}>If the problem continues, return to <Link href="/" style={{ color: "#722b3c" }}>Naksharix home</Link>.</p>
          </section>
        </main>
      </body>
    </html>
  );
}
