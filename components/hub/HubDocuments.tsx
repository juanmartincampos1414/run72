"use client";

import { useEffect, useRef, useState } from "react";
import { HubShell } from "./HubShell";
import { HUB_FOLDERS } from "@/lib/hub";

type Doc = {
  id: string;
  name: string;
  type: string | null;
  size: number | null;
  folder: string;
  created_at: string;
  url: string | null;
};

export function HubDocuments() {
  const [docs, setDocs] = useState<Doc[]>([]);
  const [loading, setLoading] = useState(true);
  const [folder, setFolder] = useState<string>("General");
  const [uploading, setUploading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const fileRef = useRef<HTMLInputElement>(null);

  async function load() {
    try {
      const d = await (await fetch("/api/hub/documents")).json();
      setDocs(d.documents ?? []);
    } catch {
      /* noop */
    } finally {
      setLoading(false);
    }
  }
  useEffect(() => {
    load();
  }, []);

  async function upload(file: File) {
    setUploading(true);
    setError(null);
    try {
      const form = new FormData();
      form.append("file", file);
      form.append("folder", folder);
      const res = await fetch("/api/hub/documents", { method: "POST", body: form });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error ?? "No se pudo subir.");
      await load();
    } catch (e) {
      setError(e instanceof Error ? e.message : "Error inesperado.");
    } finally {
      setUploading(false);
      if (fileRef.current) fileRef.current.value = "";
    }
  }

  async function remove(id: string) {
    if (!confirm("¿Eliminar este documento?")) return;
    setDocs((d) => d.filter((x) => x.id !== id));
    await fetch(`/api/hub/documents?id=${id}`, { method: "DELETE" }).catch(() => {});
  }

  const shown = docs.filter((d) => d.folder === folder);

  return (
    <HubShell>
      <div className="flex flex-wrap items-center justify-between gap-3">
        <div>
          <h1 className="font-display text-2xl font-semibold tracking-tight">Documentos</h1>
          <p className="mt-1 text-sm text-muted">
            Todo lo importante de tu negocio, ordenado y a mano.
          </p>
        </div>
        <label className="cursor-pointer rounded-full bg-gradient-to-r from-brand-cyan to-brand-violet px-5 py-2.5 text-sm font-semibold text-ink transition-transform hover:scale-[1.02]">
          {uploading ? "Subiendo…" : "Subir documento"}
          <input
            ref={fileRef}
            type="file"
            accept=".pdf,.doc,.docx,.xls,.xlsx,.png,.jpg,.jpeg"
            className="hidden"
            disabled={uploading}
            onChange={(e) => e.target.files?.[0] && upload(e.target.files[0])}
          />
        </label>
      </div>

      {/* Carpetas */}
      <div className="mt-6 flex flex-wrap gap-2">
        {HUB_FOLDERS.map((f) => {
          const count = docs.filter((d) => d.folder === f).length;
          return (
            <button
              key={f}
              onClick={() => setFolder(f)}
              className={`rounded-full border px-4 py-1.5 text-sm transition-colors ${
                folder === f
                  ? "border-transparent bg-gradient-to-br from-brand-blue/[0.14] to-brand-violet/[0.08] text-fg ring-1 ring-brand-blue/50"
                  : "border-line text-muted hover:text-fg"
              }`}
            >
              {f} {count > 0 && <span className="text-faint">· {count}</span>}
            </button>
          );
        })}
      </div>

      {error && (
        <p className="mt-4 rounded-xl border border-red-500/30 bg-red-500/10 px-4 py-3 text-sm text-red-300">
          {error}
        </p>
      )}

      {/* Lista */}
      <div className="mt-5">
        {loading ? (
          <p className="py-12 text-center text-sm text-faint">Cargando…</p>
        ) : shown.length === 0 ? (
          <div className="rounded-3xl border border-dashed border-line bg-surface/20 py-12 text-center">
            <p className="text-sm text-muted">No hay documentos en {folder}.</p>
            <p className="mt-1 text-xs text-faint">Subí tus archivos (PDF, DOCX, XLSX, PNG, JPG).</p>
          </div>
        ) : (
          <ul className="space-y-2">
            {shown.map((d) => (
              <li
                key={d.id}
                className="flex items-center justify-between gap-3 rounded-2xl border border-line bg-surface/40 p-4"
              >
                <div className="min-w-0">
                  <p className="truncate text-sm font-medium">{d.name}</p>
                  <p className="text-xs text-faint">
                    {new Date(d.created_at).toLocaleDateString("es-AR")}
                    {d.size ? ` · ${(d.size / 1024 / 1024).toFixed(1)} MB` : ""}
                  </p>
                </div>
                <div className="flex shrink-0 items-center gap-3">
                  {d.url && (
                    <a
                      href={d.url}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="text-sm text-brand-cyan hover:underline"
                    >
                      Ver
                    </a>
                  )}
                  <button
                    onClick={() => remove(d.id)}
                    className="text-xs text-faint transition-colors hover:text-red-300"
                  >
                    Eliminar
                  </button>
                </div>
              </li>
            ))}
          </ul>
        )}
      </div>
    </HubShell>
  );
}
