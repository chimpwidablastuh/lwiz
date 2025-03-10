"use client";

import { useEffect, useState } from "react";
import FingerprintJS from "@fingerprintjs/fingerprintjs";

export function useFingerprint() {
  const [fingerprint, setFingerprint] = useState<string | null>(null);

  useEffect(() => {
    if (typeof window === "undefined") return; // Évite l'exécution côté serveur

    const loadFingerprint = async () => {
      try {
        const fp = await FingerprintJS.load();
        const result = await fp.get();
        setFingerprint(result.visitorId);
      } catch (error) {
        console.error("Erreur lors de la récupération du fingerprint:", error);
        setFingerprint("Erreur");
      }
    };

    loadFingerprint();
  }, []);

  return fingerprint;
}
