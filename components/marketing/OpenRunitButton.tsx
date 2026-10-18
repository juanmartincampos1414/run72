"use client";

// Abre el panel de Runit (lo escucha RunitLauncher).
export function OpenRunitButton({ className = "", children }: { className?: string; children: React.ReactNode }) {
  return (
    <button
      type="button"
      className={className}
      onClick={() => window.dispatchEvent(new CustomEvent("run:open-runit"))}
    >
      {children}
    </button>
  );
}
