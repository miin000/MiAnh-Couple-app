"use client";

import * as React from "react";

export function PwaRegister() {
  React.useEffect(() => {
    if ("serviceWorker" in navigator) {
      void navigator.serviceWorker.register("/sw.js", { scope: "/" });
    }
  }, []);

  return null;
}
