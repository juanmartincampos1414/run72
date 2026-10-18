"use client";

// Abre el gestor de consentimiento (lo escucha ConsentManager).
export function ConsentSettingsButton({ className = "", children }: { className?: string; children: React.ReactNode }) {
  return (
    <button
      type="button"
      id="consent-settings"
      className={className}
      onClick={() => window.dispatchEvent(new CustomEvent("run:open-consent"))}
    >
      {children}
    </button>
  );
}
