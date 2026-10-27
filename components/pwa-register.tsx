"use client";

import { useEffect } from "react";

export function PwaRegister() {
  useEffect(() => {
    // Avoid a persistent worker intercepting disposable localhost release QA
    // navigation/hydration tests. Real deployed HTTPS hosts still register.
    if ("serviceWorker" in navigator && process.env.NODE_ENV === "production" &&
      !["localhost", "127.0.0.1"].includes(window.location.hostname)) {
      navigator.serviceWorker.register("/sw.js").catch(() => undefined);
    }
  }, []);

  return null;
}
