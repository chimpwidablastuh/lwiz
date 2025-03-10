"use client";

import { atom } from "jotai";
import FingerprintJS from "@fingerprintjs/fingerprintjs";

export const fingerprintAtom = atom(async (get) => {
  if (typeof window !== "undefined") {
    const fp = await FingerprintJS.load();
    const result = await fp.get();
    return result.visitorId;
  }
});
