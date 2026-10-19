"use client";

import { useEffect } from "react";
import { captureAttribution } from "@/lib/marketing/attribution";

// Captura la atribución (UTM/referrer/landing) en la primera visita. No depende
// del consentimiento de marketing: es atribución necesaria para procesar un
// formulario (first-party, no se envía a trackers publicitarios).
export function AttributionTracker() {
  useEffect(() => {
    captureAttribution();
  }, []);
  return null;
}
